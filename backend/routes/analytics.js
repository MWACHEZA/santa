const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Track page visit (public endpoint)
router.post('/track', async (req, res) => {
  try {
    const {
      page_path,
      referrer,
      user_agent,
      session_id
    } = req.body;
    
    if (!page_path) {
      return res.status(400).json({
        success: false,
        message: 'Page path is required'
      });
    }
    
    // Get visitor IP (considering proxy headers)
    const visitorIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    const analyticsId = uuidv4();
    
    await db.execute(`
      INSERT INTO analytics (
        id, page_path, visitor_ip, user_agent, referrer, 
        session_id, visit_date
      ) VALUES (?, ?, ?, ?, ?, ?, CURDATE())
    `, [
      analyticsId, page_path, visitorIp, user_agent, 
      referrer, session_id
    ]);
    
    res.json({
      success: true,
      message: 'Visit tracked successfully'
    });
    
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track visit'
    });
  }
});

// Get analytics overview (admin only)
router.get('/overview', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    // Get basic statistics
    const [basicStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT page_path) as pages_visited,
        COUNT(DISTINCT DATE(visit_time)) as active_days
      FROM analytics
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `, [days]);
    
    // Get today's statistics
    const [todayStats] = await db.execute(`
      SELECT 
        COUNT(*) as today_visits,
        COUNT(DISTINCT visitor_ip) as today_visitors,
        COUNT(DISTINCT session_id) as today_sessions
      FROM analytics
      WHERE visit_date = CURDATE()
    `);
    
    // Get most popular pages
    const [popularPages] = await db.execute(`
      SELECT 
        page_path,
        COUNT(*) as visit_count,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM analytics WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY))), 2) as percentage
      FROM analytics
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY page_path
      ORDER BY visit_count DESC
      LIMIT 10
    `, [days, days]);
    
    // Get daily visits for the period
    const [dailyVisits] = await db.execute(`
      SELECT 
        visit_date,
        COUNT(*) as visits,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        COUNT(DISTINCT session_id) as sessions
      FROM analytics
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY visit_date
      ORDER BY visit_date DESC
    `, [days]);
    
    // Get referrer statistics
    const [referrerStats] = await db.execute(`
      SELECT 
        CASE 
          WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
          WHEN referrer LIKE '%google%' THEN 'Google'
          WHEN referrer LIKE '%facebook%' THEN 'Facebook'
          WHEN referrer LIKE '%twitter%' THEN 'Twitter'
          ELSE 'Other'
        END as referrer_type,
        COUNT(*) as visit_count
      FROM analytics
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY referrer_type
      ORDER BY visit_count DESC
    `, [days]);
    
    res.json({
      success: true,
      data: {
        period: `${days} days`,
        overview: {
          ...basicStats[0],
          ...todayStats[0]
        },
        popularPages,
        dailyVisits,
        referrerStats
      }
    });
    
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview'
    });
  }
});

// Get page analytics (admin only)
router.get('/pages', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const page = req.query.page;
    
    let whereCondition = 'visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
    let queryParams = [days];
    
    if (page) {
      whereCondition += ' AND page_path = ?';
      queryParams.push(page);
    }
    
    // Get page statistics
    const [pageStats] = await db.execute(`
      SELECT 
        page_path,
        COUNT(*) as total_visits,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        COUNT(DISTINCT session_id) as sessions,
        AVG(TIME_TO_SEC(TIMEDIFF(
          LEAD(visit_time) OVER (PARTITION BY session_id ORDER BY visit_time),
          visit_time
        ))) as avg_time_on_page
      FROM analytics
      WHERE ${whereCondition}
      GROUP BY page_path
      ORDER BY total_visits DESC
    `, queryParams);
    
    // Get hourly distribution
    const [hourlyStats] = await db.execute(`
      SELECT 
        HOUR(visit_time) as hour,
        COUNT(*) as visit_count
      FROM analytics
      WHERE ${whereCondition}
      GROUP BY HOUR(visit_time)
      ORDER BY hour
    `, queryParams);
    
    res.json({
      success: true,
      data: {
        period: `${days} days`,
        pageStats,
        hourlyDistribution: hourlyStats
      }
    });
    
  } catch (error) {
    console.error('Get page analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page analytics'
    });
  }
});

// Get visitor analytics (admin only)
router.get('/visitors', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    // Get visitor statistics
    const [visitorStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        COUNT(DISTINCT session_id) as total_sessions,
        AVG(visits_per_visitor) as avg_visits_per_visitor,
        AVG(pages_per_session) as avg_pages_per_session
      FROM (
        SELECT 
          visitor_ip,
          session_id,
          COUNT(*) as visits_per_visitor,
          COUNT(DISTINCT page_path) as pages_per_session
        FROM analytics
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY visitor_ip, session_id
      ) as visitor_sessions
    `, [days]);
    
    // Get new vs returning visitors (simplified - based on IP)
    const [visitorTypes] = await db.execute(`
      SELECT 
        CASE 
          WHEN first_visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) THEN 'New'
          ELSE 'Returning'
        END as visitor_type,
        COUNT(*) as visitor_count
      FROM (
        SELECT 
          visitor_ip,
          MIN(visit_date) as first_visit_date
        FROM analytics
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY visitor_ip
      ) as visitor_first_visits
      GROUP BY visitor_type
    `, [days, days]);
    
    // Get top countries/regions (simplified - would need GeoIP in production)
    const [locationStats] = await db.execute(`
      SELECT 
        SUBSTRING_INDEX(visitor_ip, '.', 2) as ip_prefix,
        COUNT(DISTINCT visitor_ip) as visitor_count
      FROM analytics
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND visitor_ip IS NOT NULL
      GROUP BY ip_prefix
      ORDER BY visitor_count DESC
      LIMIT 10
    `, [days]);
    
    res.json({
      success: true,
      data: {
        period: `${days} days`,
        overview: visitorStats[0],
        visitorTypes,
        locationStats
      }
    });
    
  } catch (error) {
    console.error('Get visitor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitor analytics'
    });
  }
});

// Get real-time analytics (admin only)
router.get('/realtime', authenticateToken, requireContentManager, async (req, res) => {
  try {
    // Get visitors in the last hour
    const [realtimeStats] = await db.execute(`
      SELECT 
        COUNT(*) as visits_last_hour,
        COUNT(DISTINCT visitor_ip) as visitors_last_hour,
        COUNT(DISTINCT session_id) as sessions_last_hour
      FROM analytics
      WHERE visit_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);
    
    // Get current active pages (last 30 minutes)
    const [activePages] = await db.execute(`
      SELECT 
        page_path,
        COUNT(*) as current_visits,
        COUNT(DISTINCT visitor_ip) as current_visitors
      FROM analytics
      WHERE visit_time >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
      GROUP BY page_path
      ORDER BY current_visits DESC
      LIMIT 10
    `);
    
    // Get recent visits
    const [recentVisits] = await db.execute(`
      SELECT 
        page_path,
        visitor_ip,
        visit_time,
        referrer
      FROM analytics
      WHERE visit_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY visit_time DESC
      LIMIT 20
    `);
    
    res.json({
      success: true,
      data: {
        overview: realtimeStats[0],
        activePages,
        recentVisits
      }
    });
    
  } catch (error) {
    console.error('Get realtime analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch realtime analytics'
    });
  }
});

// Get content analytics (admin only)
router.get('/content', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    // Get news analytics
    const [newsAnalytics] = await db.execute(`
      SELECT 
        'news' as content_type,
        COUNT(DISTINCT n.id) as total_items,
        SUM(CASE WHEN n.is_published = true THEN 1 ELSE 0 END) as published_items,
        COALESCE(SUM(a.visit_count), 0) as total_views
      FROM news n
      LEFT JOIN (
        SELECT 
          SUBSTRING_INDEX(page_path, '/', -1) as content_id,
          COUNT(*) as visit_count
        FROM analytics
        WHERE page_path LIKE '/news/%'
          AND visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY content_id
      ) a ON n.id = a.content_id
    `, [days]);
    
    // Get events analytics
    const [eventsAnalytics] = await db.execute(`
      SELECT 
        'events' as content_type,
        COUNT(DISTINCT e.id) as total_items,
        SUM(CASE WHEN e.is_published = true THEN 1 ELSE 0 END) as published_items,
        COALESCE(SUM(a.visit_count), 0) as total_views
      FROM events e
      LEFT JOIN (
        SELECT 
          SUBSTRING_INDEX(page_path, '/', -1) as content_id,
          COUNT(*) as visit_count
        FROM analytics
        WHERE page_path LIKE '/events/%'
          AND visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY content_id
      ) a ON e.id = a.content_id
    `, [days]);
    
    // Get most viewed content
    const [mostViewed] = await db.execute(`
      SELECT 
        page_path,
        COUNT(*) as view_count,
        COUNT(DISTINCT visitor_ip) as unique_viewers
      FROM analytics
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND (page_path LIKE '/news/%' OR page_path LIKE '/events/%')
      GROUP BY page_path
      ORDER BY view_count DESC
      LIMIT 10
    `, [days]);
    
    res.json({
      success: true,
      data: {
        period: `${days} days`,
        contentStats: [...newsAnalytics, ...eventsAnalytics],
        mostViewedContent: mostViewed
      }
    });
    
  } catch (error) {
    console.error('Get content analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content analytics'
    });
  }
});

// Clean old analytics data (admin only)
router.delete('/cleanup', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90; // Default to keep 90 days
    
    const [result] = await db.execute(
      'DELETE FROM analytics WHERE visit_date < DATE_SUB(CURDATE(), INTERVAL ? DAY)',
      [days]
    );
    
    res.json({
      success: true,
      message: `Cleaned up analytics data older than ${days} days`,
      data: {
        deleted_records: result.affectedRows
      }
    });
    
  } catch (error) {
    console.error('Cleanup analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup analytics data'
    });
  }
});

module.exports = router;
