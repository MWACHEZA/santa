// Simple export utilities without external dependencies
// Note: For full PDF and Excel support, install: npm install jspdf jspdf-autotable xlsx

export interface ExportData {
  title: string;
  data: any[];
  headers?: string[];
  filename?: string;
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export class ExportManager {
  
  static async exportToPDF(exportData: ExportData): Promise<void> {
    // For PDF export, we'll create an HTML version and let the user print to PDF
    this.printReport(exportData.title, this.generateHTMLTable(exportData));
  }
  
  static async exportToExcel(exportData: ExportData): Promise<void> {
    // For Excel, we'll export as CSV which can be opened in Excel
    await this.exportToCSV(exportData);
    alert('File exported as CSV. You can open it in Excel.');
  }
  
  static async exportToCSV(exportData: ExportData): Promise<void> {
    const { title, data, headers, filename = 'report' } = exportData;
    
    const csvHeaders = headers || (data.length > 0 ? Object.keys(data[0]) : []);
    
    // Create CSV content
    let csvContent = `${title}\n`;
    csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    // Add headers
    csvContent += csvHeaders.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = csvHeaders.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvContent += row.join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  static async exportToJSON(exportData: ExportData): Promise<void> {
    const { title, data, filename = 'report' } = exportData;
    
    const jsonData = {
      title,
      generatedOn: new Date().toISOString(),
      data
    };
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  static async exportData(format: ExportFormat, exportData: ExportData): Promise<void> {
    try {
      switch (format) {
        case 'pdf':
          await this.exportToPDF(exportData);
          break;
        case 'excel':
          await this.exportToExcel(exportData);
          break;
        case 'csv':
          await this.exportToCSV(exportData);
          break;
        case 'json':
          await this.exportToJSON(exportData);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
  
  // Generate HTML table from export data
  static generateHTMLTable(exportData: ExportData): string {
    const { data, headers } = exportData;
    const tableHeaders = headers || (data.length > 0 ? Object.keys(data[0]) : []);
    
    let html = '<table>';
    
    // Add headers
    html += '<thead><tr>';
    tableHeaders.forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += '</tr></thead>';
    
    // Add data rows
    html += '<tbody>';
    data.forEach(item => {
      html += '<tr>';
      tableHeaders.forEach(header => {
        const value = item[header];
        const displayValue = value === null || value === undefined ? '' : String(value);
        html += `<td>${displayValue}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    return html;
  }

  // Print functionality
  static printReport(title: string, content: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the report');
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2d5016;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2d5016;
              margin: 0;
            }
            .generated-date {
              color: #666;
              font-size: 14px;
              margin-top: 10px;
            }
            .content {
              line-height: 1.6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #2d5016;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <div class="generated-date">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          <div class="content">
            ${content}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}

// Analytics-specific export functions
export class AnalyticsExporter {
  
  static exportUserAnalytics(users: any[], format: ExportFormat): void {
    const exportData: ExportData = {
      title: 'User Analytics Report',
      data: users.map(user => ({
        'Username': user.username,
        'Full Name': `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        'Email': user.email || 'N/A',
        'Role': user.role,
        'Association': user.association || 'N/A',
        'Section': user.section || 'N/A',
        'Baptized': user.isBaptized ? 'Yes' : user.isBaptized === false ? 'No' : 'N/A',
        'Confirmed': user.isConfirmed ? 'Yes' : user.isConfirmed === false ? 'No' : 'N/A',
        'Receives Communion': user.receivesCommunion ? 'Yes' : user.receivesCommunion === false ? 'No' : 'N/A',
        'Married': user.isMarried ? 'Yes' : user.isMarried === false ? 'No' : 'N/A',
        'Spouse': user.spouseName || 'N/A',
        'Created': new Date(user.createdAt).toLocaleDateString(),
        'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      })),
      filename: `user-analytics-${new Date().toISOString().split('T')[0]}`
    };
    
    ExportManager.exportData(format, exportData);
  }
  
  static exportVideoAnalytics(videos: any[], format: ExportFormat): void {
    const exportData: ExportData = {
      title: 'Video Analytics Report',
      data: videos.map(video => ({
        'Title': video.title,
        'Category': video.category,
        'Views': video.views,
        'Duration': video.duration || 'N/A',
        'Published': video.isPublished ? 'Yes' : 'No',
        'Published Date': video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'N/A',
        'Created By': video.createdByUsername || 'N/A',
        'Created Date': new Date(video.createdAt).toLocaleDateString()
      })),
      filename: `video-analytics-${new Date().toISOString().split('T')[0]}`
    };
    
    ExportManager.exportData(format, exportData);
  }
  
  static exportContentAnalytics(content: any[], format: ExportFormat): void {
    const exportData: ExportData = {
      title: 'Content Analytics Report',
      data: content.map(item => ({
        'Content Type': item.type,
        'Title': item.title,
        'Views': item.views,
        'Category': item.category || 'N/A',
        'Published': item.isPublished ? 'Yes' : 'No',
        'Author': item.author || 'N/A',
        'Created Date': new Date(item.createdAt).toLocaleDateString()
      })),
      filename: `content-analytics-${new Date().toISOString().split('T')[0]}`
    };
    
    ExportManager.exportData(format, exportData);
  }
  
  static printAnalyticsSummary(analyticsData: any): void {
    const content = `
      <h2>Analytics Summary</h2>
      
      <h3>User Statistics</h3>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Users</td><td>${analyticsData.users?.total || 0}</td></tr>
        <tr><td>Active Users</td><td>${analyticsData.users?.active || 0}</td></tr>
        <tr><td>New This Month</td><td>${analyticsData.users?.newThisMonth || 0}</td></tr>
      </table>
      
      <h3>Content Statistics</h3>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Views</td><td>${analyticsData.content?.totalViews || 0}</td></tr>
        <tr><td>Video Views</td><td>${analyticsData.content?.videoViews || 0}</td></tr>
        <tr><td>News Views</td><td>${analyticsData.content?.newsViews || 0}</td></tr>
      </table>
      
      <h3>Video Statistics</h3>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Videos</td><td>${analyticsData.videos?.totalVideos || 0}</td></tr>
        <tr><td>Live Streams</td><td>${analyticsData.videos?.liveStreams || 0}</td></tr>
        <tr><td>Total Watch Time</td><td>${analyticsData.videos?.totalWatchTime || 'N/A'}</td></tr>
      </table>
    `;
    
    ExportManager.printReport('Analytics Summary Report', content);
  }
}
