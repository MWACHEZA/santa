import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'nd' | 'sn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.ministries': 'Ministries',
    'nav.outreach': 'Outreach',
    'nav.sacraments': 'Sacraments',
    'nav.events': 'Events',
    'nav.contact': 'Contact',
    'nav.giving': 'Giving',
    
    // Homepage
    'home.welcome': 'Welcome to St. Patrick\'s Catholic Church',
    'home.subtitle': 'Makokoba, Bulawayo - Your Community of Faith',
    'home.urgent': 'Urgent Announcements',
    'home.mass_times': 'Mass Times',
    'home.confession_times': 'Confession Times',
    'home.daily_mass': 'Daily Mass',
    'home.sunday_mass': 'Sunday Mass',
    'home.saturday_evening': 'Saturday Evening',
    'home.contact_us': 'Contact Us',
    'home.visit_us': 'Visit Us',
    
    // Mass Schedule
    'mass.weekdays': 'Weekdays: 6:00 AM',
    'mass.saturday': 'Saturday: 6:00 PM',
    'mass.sunday_early': 'Sunday: 6:00 AM',
    'mass.sunday_main': 'Sunday: 8:30 AM (Main)',
    'mass.sunday_evening': 'Sunday: 5:00 PM',
    
    // Confession
    'confession.saturday': 'Saturday: 5:00 PM - 5:45 PM',
    'confession.sunday': 'Sunday: Before each Mass',
    'confession.appointment': 'Or by appointment',
    
    // Outreach
    'outreach.title': 'Social Justice & Community Outreach',
    'outreach.caritas': 'Caritas Outreach',
    'outreach.caritas_desc': 'Food aid, health support, and education assistance for Makokoba and Mzilikazi communities',
    'outreach.hiv_aids': 'HIV/AIDS Ministry',
    'outreach.hiv_aids_desc': 'Support programs and ministry for those affected by HIV/AIDS',
    'outreach.education': 'Education Support',
    'outreach.education_desc': 'Tutoring programs and scholarship opportunities for local youth',
    
    // Ministries
    'ministries.title': 'Parish Ministries',
    'ministries.choir': 'Parish Choir',
    'ministries.youth': 'Youth Group',
    'ministries.womens': 'Women\'s League',
    'ministries.mens': 'Men\'s Guild',
    'ministries.prayer': 'Prayer Groups',
    
    // Sacraments
    'sacraments.title': 'Sacraments',
    'sacraments.baptism': 'Baptism',
    'sacraments.confirmation': 'Confirmation',
    'sacraments.marriage': 'Marriage',
    'sacraments.rcia': 'RCIA (Adult Formation)',
    
    // Contact
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.parish_address': 'St. Patrick\'s Catholic Church, Makokoba, Bulawayo, Zimbabwe',
    
    // Giving
    'giving.title': 'Support Our Parish',
    'giving.subtitle': 'Your generous contributions help support our parish community and outreach ministries',
    'giving.offertory': 'Sunday Offertory',
    'giving.online': 'Online Giving',
    'giving.bank': 'Bank Transfer',
    
    // Community
    'community.diaspora': 'Diaspora Corner',
    'community.diaspora_desc': 'Updates for former parishioners living abroad',
    'community.gallery': 'Parish Life Gallery',
    'community.events': 'Upcoming Events',
    
    // Language Toggle
    'lang.switch_to_ndebele': 'IsiNdebele',
    'lang.switch_to_english': 'English',
    'lang.switch_to_shona': 'ChiShona',
    
    // Prayers & Daily Devotion
    'prayers.title': 'Prayers & Daily Devotion',
    'prayers.subtitle': 'Join us in prayer and find spiritual nourishment through these sacred words and daily readings',
    'prayers.daily_readings': 'Today\'s Liturgical Readings',
    'prayers.first_reading': 'First Reading',
    'prayers.psalm': 'Responsorial Psalm',
    'prayers.gospel': 'Gospel',
    'prayers.reflection': 'Reflection',
    'prayers.response': 'Response',
    'prayers.liturgical_season': 'Liturgical Season',
    'prayers.liturgical_color': 'Liturgical Color',
    
    // Gallery
    'gallery.title': 'Parish Life Gallery',
    'gallery.subtitle': 'Celebrating our faith community through moments of joy, worship, and fellowship',
    'gallery.view_full': 'View Full Pictures',
    
    // Ministries
    'ministries.liturgical': 'Liturgical Ministry',
    'ministries.committees': 'Committees',
    'ministries.parish_council': 'Parish Council',
    'ministries.development_council': 'Parish Development Council',
    'ministries.liturgical_committee': 'Liturgical Committee',
    'ministries.catechists': 'Catechists',
    
    // Admin
    'admin.login': 'Admin Login',
    'admin.dashboard': 'Admin Dashboard',
    'admin.manage_prayers': 'Manage Prayers & Daily Readings',
    'admin.add_prayer': 'Add Prayer',
    'admin.edit_prayer': 'Edit Prayer',
    'admin.delete_prayer': 'Delete Prayer',
    'admin.prayer_title': 'Prayer Title',
    'admin.prayer_text': 'Prayer Text',
    'admin.prayer_category': 'Category',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    
    // Authentication
    'auth.welcome_back': 'Welcome Back',
    'auth.sign_in_church': 'Sign in to St. Patrick\'s Catholic Church',
    'auth.parishioner_login': 'Parishioner Login',
    'auth.admin_login': 'Admin Login',
    'auth.email_phone_username': 'Email, Phone, or Username',
    'auth.enter_credentials': 'Enter your email, phone, or username',
    'auth.password': 'Password',
    'auth.enter_password': 'Enter your password',
    'auth.sign_in': 'Sign In',
    'auth.authenticating': 'Authenticating...',
    'auth.new_to_parish': 'New to our parish community?',
    'auth.register_parishioner': 'Register as Parishioner',
    'auth.help_text': 'Use the quick login buttons above or enter your credentials manually.',
    
    // Registration
    'register.join_community': 'Join Our Parish Community',
    'register.become_member': 'Register to become a member of St. Patrick\'s Catholic Church',
    'register.personal_info': 'Personal Information',
    'register.first_name': 'First Name',
    'register.last_name': 'Last Name',
    'register.date_birth': 'Date of Birth',
    'register.contact_info': 'Contact Information',
    'register.email_address': 'Email Address',
    'register.phone_number': 'Phone Number',
    'register.address': 'Address',
    'register.emergency_contact': 'Emergency Contact (Optional)',
    'register.emergency_name': 'Emergency Contact Name',
    'register.emergency_phone': 'Emergency Contact Phone',
    'register.account_security': 'Account Security',
    'register.confirm_password': 'Confirm Password',
    'register.terms_conditions': 'I agree to the Terms and Conditions and Privacy Policy of St. Patrick\'s Catholic Church',
    'register.fill_sample': 'Fill Sample Data',
    'register.register_button': 'Register as Parishioner',
    'register.registering': 'Registering...',
    'register.already_account': 'Already have an account?',
    'register.sign_in_here': 'Sign In Here',
    'register.need_help': 'Need Help?',
    'register.contact_office': 'Contact the parish office',
    
    // Form Validation
    'validation.required': 'This field is required',
    'validation.email_invalid': 'Please enter a valid email address',
    'validation.phone_invalid': 'Please enter a valid Zimbabwe phone number',
    'validation.password_min': 'Password must be at least 6 characters long',
    'validation.passwords_match': 'Passwords do not match',
    'validation.age_minimum': 'You must be at least 13 years old to register',
    'validation.terms_required': 'You must agree to the terms and conditions',
    
    // Messages
    'message.registration_success': 'Registration successful! Please sign in with your credentials.',
    'message.login_success': 'Login successful!',
    'message.login_failed': 'Invalid credentials. Please try again.',
    'message.error_occurred': 'An error occurred. Please try again.',
    
    // Common UI
    'ui.loading': 'Loading...',
    'ui.submit': 'Submit',
    'ui.cancel': 'Cancel',
    'ui.close': 'Close',
    'ui.edit': 'Edit',
    'ui.delete': 'Delete',
    'ui.view': 'View',
    'ui.back': 'Back',
    'ui.next': 'Next',
    'ui.previous': 'Previous',
    'ui.search': 'Search',
    'ui.filter': 'Filter',
    'ui.sort': 'Sort',
    'ui.refresh': 'Refresh',
    'ui.logout': 'Logout',
    
    // Footer
    'footer.all_rights': 'All rights reserved',
    'footer.archdiocese': 'Part of the Archdiocese of Bulawayo',
    'footer.support_mission': 'Support Our Mission',
    'footer.follow_us': 'Follow Us',
    'footer.quick_links': 'Quick Links',
    'footer.mass_times_footer': 'Mass Times',
    'footer.contact_info_footer': 'Contact Info',
  },
  nd: {
    // Navigation (IsiNdebele translations)
    'nav.home': 'Ikhaya',
    'nav.about': 'Ngathi',
    'nav.ministries': 'Imisebenzi',
    'nav.outreach': 'Ukusiza',
    'nav.sacraments': 'Izakramente',
    'nav.events': 'Imicimbi',
    'nav.contact': 'Thintana Nathi',
    'nav.giving': 'Ukupha',
    
    // Homepage
    'home.welcome': 'Siyakwamukela eSt. Patrick\'s Catholic Church',
    'home.subtitle': 'Makokoba, Bulawayo - Umphakathi Wethu Wokholo',
    'home.urgent': 'Izimemezelo Eziphuthumayo',
    'home.mass_times': 'Izikhathi Zemisa',
    'home.confession_times': 'Izikhathi Zokuvuma',
    'home.daily_mass': 'Imisa Yansuku Zonke',
    'home.sunday_mass': 'Imisa YeSonto',
    'home.saturday_evening': 'NgoMgqibelo Ntambama',
    'home.contact_us': 'Thintana Nathi',
    'home.visit_us': 'Sizivakashele',
    
    // Mass Schedule
    'mass.weekdays': 'Izinsuku Zeviki: 6:00 AM',
    'mass.saturday': 'NgoMgqibelo: 6:00 PM',
    'mass.sunday_early': 'NgoSonto: 6:00 AM',
    'mass.sunday_main': 'NgoSonto: 8:30 AM (Enkulu)',
    'mass.sunday_evening': 'NgoSonto: 5:00 PM',
    
    // Confession
    'confession.saturday': 'NgoMgqibelo: 5:00 PM - 5:45 PM',
    'confession.sunday': 'NgoSonto: Ngaphambi kwemisa ngayinye',
    'confession.appointment': 'Kumbe ngokucela isikhathi',
    
    // Outreach
    'outreach.title': 'Ukulunga Komphakathi Nokusiza',
    'outreach.caritas': 'Caritas Ukusiza',
    'outreach.caritas_desc': 'Ukusiza ngokudla, impilo, lemfundo eMakokoba naseMzilikazi',
    'outreach.hiv_aids': 'Umsebenzi we-HIV/AIDS',
    'outreach.hiv_aids_desc': 'Izinhlelo zokusiza labo abathintekile yi-HIV/AIDS',
    'outreach.education': 'Ukusiza Ngemfundo',
    'outreach.education_desc': 'Izinhlelo zokufundisa lamathuba emfundo entsha',
    
    // Ministries
    'ministries.title': 'Imisebenzi Yebandla',
    'ministries.choir': 'Ikwaya Lebandla',
    'ministries.youth': 'Iqembu Lentsha',
    'ministries.womens': 'Umanyano Labesifazane',
    'ministries.mens': 'Umanyano Lamadoda',
    'ministries.prayer': 'Amaqembu Okukhuleka',
    
    // Sacraments
    'sacraments.title': 'Izakramente',
    'sacraments.baptism': 'Ubhabhathizo',
    'sacraments.confirmation': 'Ukuqiniswa',
    'sacraments.marriage': 'Umtshado',
    'sacraments.rcia': 'RCIA (Ukufundiswa Kwabantu Abadala)',
    
    // Contact
    'contact.address': 'Ikheli',
    'contact.phone': 'Ucingo',
    'contact.email': 'I-email',
    'contact.parish_address': 'St. Patrick\'s Catholic Church, Makokoba, Bulawayo, Zimbabwe',
    
    // Giving
    'giving.title': 'Sekela Ibandla Lethu',
    'giving.subtitle': 'Iminikelo yenu iyasisiza ukusekela umphakathi wethu lemisebenzi yokusiza',
    'giving.offertory': 'Umnikelo WeSonto',
    'giving.online': 'Ukunikela Nge-intanethi',
    'giving.bank': 'Ukudlulisela Ebhangini',
    
    // Community
    'community.diaspora': 'Ikona Yabasemzini',
    'community.diaspora_desc': 'Izindaba zamalungu asemzini',
    'community.gallery': 'Imifanekiso Yebandla',
    'community.events': 'Imicimbi Ezayo',
    
    // Language Toggle
    'lang.switch_to_ndebele': 'IsiNdebele',
    'lang.switch_to_english': 'IsiNgisi',
    'lang.switch_to_shona': 'ChiShona',
    
    // Prayers & Daily Devotion
    'prayers.title': 'Imikhuleko Lokukhongolose Kwansuku Zonke',
    'prayers.subtitle': 'Hlanganyela nathi ekukhulekeni uthole ukondla komoya ngala mazwi angcwele lokufundwa kwansuku zonke',
    'prayers.daily_readings': 'Ukufundwa Kweliturgical Kwanamuhla',
    'prayers.first_reading': 'Ukufundwa Kokuqala',
    'prayers.psalm': 'Ihubo Lokuphendula',
    'prayers.gospel': 'Ivangeli',
    'prayers.reflection': 'Ukucabanga',
    'prayers.response': 'Impendulo',
    'prayers.liturgical_season': 'Isikhathi Seliturgical',
    'prayers.liturgical_color': 'Umbala Weliturgical',
    
    // Gallery
    'gallery.title': 'Imifanekiso Yokuphila Kwebandla',
    'gallery.subtitle': 'Sigubha umphakathi wethu wokholo ngezikhathi zenjabulo, ukukhonza, lobudlelwano',
    'gallery.view_full': 'Bona Imifanekiso Epheleleyo',
    
    // Ministries
    'ministries.liturgical': 'Umsebenzi Weliturgical',
    'ministries.committees': 'Amakomiti',
    'ministries.parish_council': 'Ikomiti Lebandla',
    'ministries.development_council': 'Ikomiti Yentuthuko Yebandla',
    'ministries.liturgical_committee': 'Ikomiti Yeliturgical',
    'ministries.catechists': 'Abafundisi Bekatekismu',
    
    // Admin
    'admin.login': 'Ukungena Kwesilawuli',
    'admin.dashboard': 'Ibhodi Lesilawuli',
    'admin.manage_prayers': 'Lawula Imikhuleko Lokufundwa Kwansuku Zonke',
    'admin.add_prayer': 'Engeza Umkhuleko',
    'admin.edit_prayer': 'Hlela Umkhuleko',
    'admin.delete_prayer': 'Susa Umkhuleko',
    'admin.prayer_title': 'Isihloko Somkhuleko',
    'admin.prayer_text': 'Umbhalo Womkhuleko',
    'admin.prayer_category': 'Isigaba',
    'admin.save': 'Gcina',
    'admin.cancel': 'Khansela',
    
    // Authentication
    'auth.welcome_back': 'Siyakwemukela Futhi',
    'auth.sign_in_church': 'Ngena eSt. Patrick\'s Catholic Church',
    'auth.parishioner_login': 'Ukungena Kwamalungu',
    'auth.admin_login': 'Ukungena Kwesilawuli',
    'auth.email_phone_username': 'I-email, Ucingo, Kumbe Igama Lomsebenzisi',
    'auth.enter_credentials': 'Faka i-email yakho, ucingo, kumbe igama lomsebenzisi',
    'auth.password': 'Iphasiwedi',
    'auth.enter_password': 'Faka iphasiwedi yakho',
    'auth.sign_in': 'Ngena',
    'auth.authenticating': 'Siyaqinisekisa...',
    'auth.new_to_parish': 'Umutsha emphakathini wethu webandla?',
    'auth.register_parishioner': 'Zibhalise Njengelungu',
    'auth.help_text': 'Sebenzisa amaqhosha okuphakamisa ngenhla kumbe ufake imininingwane yakho.',
    
    // Registration
    'register.join_community': 'Joyina Umphakathi Wethu Webandla',
    'register.become_member': 'Zibhalise ukuze ube lilungu leSt. Patrick\'s Catholic Church',
    'register.personal_info': 'Imininingwane Yomuntu Siqu',
    'register.first_name': 'Igama Lokuqala',
    'register.last_name': 'Isibongo',
    'register.date_birth': 'Usuku Lokuzalwa',
    'register.contact_info': 'Imininingwane Yokuthintana',
    'register.email_address': 'Ikheli Le-email',
    'register.phone_number': 'Inombolo Yocingo',
    'register.address': 'Ikheli',
    'register.emergency_contact': 'Othintana Naye Ngesikhathi Sesiphuthumayo (Akuphoqelekile)',
    'register.emergency_name': 'Igama Lothintana Naye Ngesikhathi Sesiphuthumayo',
    'register.emergency_phone': 'Ucingo Wothintana Naye Ngesikhathi Sesiphuthumayo',
    'register.account_security': 'Ukuphepha Kwe-akhawunti',
    'register.confirm_password': 'Qinisekisa Iphasiwedi',
    'register.terms_conditions': 'Ngiyavuma Imigomo Nemibandela kanye Nendlela Yokuvikela Ubumfihlo beSt. Patrick\'s Catholic Church',
    'register.fill_sample': 'Gcwalisa Imininingwane Yesibonelo',
    'register.register_button': 'Zibhalise Njengelungu',
    'register.registering': 'Siyakubhalisa...',
    'register.already_account': 'Usulomsebenzi?',
    'register.sign_in_here': 'Ngena Lapha',
    'register.need_help': 'Udinga Usizo?',
    'register.contact_office': 'Thintana nehhovisi lebandla',
    
    // Form Validation
    'validation.required': 'Leli nsimu liyaphoqeleka',
    'validation.email_invalid': 'Sicela ufake ikheli le-email elivumelekile',
    'validation.phone_invalid': 'Sicela ufake inombolo yocingo yaseZimbabwe evumelekile',
    'validation.password_min': 'Iphasiwedi kumele ibe nobunye ubude obungaphansi kwezinhlamvu eziyisithupha',
    'validation.passwords_match': 'Amaphasiwedi kawafani',
    'validation.age_minimum': 'Kumele ube neminyaka engaphansi kwe-13 ukuze uzibhalise',
    'validation.terms_required': 'Kumele uvume imigomo nemibandela',
    
    // Messages
    'message.registration_success': 'Ukubhalisa kuphumelele! Sicela ungene ngemininingo yakho.',
    'message.login_success': 'Ukungena kuphumelele!',
    'message.login_failed': 'Imininingwane engalungile. Sicela uzame futhi.',
    'message.error_occurred': 'Kukhonile iphutha. Sicela uzame futhi.',
    
    // Common UI
    'ui.loading': 'Siyalayisha...',
    'ui.submit': 'Thumela',
    'ui.cancel': 'Khansela',
    'ui.close': 'Vala',
    'ui.edit': 'Hlela',
    'ui.delete': 'Susa',
    'ui.view': 'Bona',
    'ui.back': 'Emuva',
    'ui.next': 'Okulandelayo',
    'ui.previous': 'Okwandulela',
    'ui.search': 'Sesha',
    'ui.filter': 'Hlunguza',
    'ui.sort': 'Hlela',
    'ui.refresh': 'Vuselela',
    'ui.logout': 'Phuma',
    
    // Footer
    'footer.all_rights': 'Wonke amalungelo agodliwe',
    'footer.archdiocese': 'Ingxenye ye-Archdiocese yaseBulawayo',
    'footer.support_mission': 'Sekela Umsebenzi Wethu',
    'footer.follow_us': 'Silandele',
    'footer.quick_links': 'Izixhumanisi Ezisheshayo',
    'footer.mass_times_footer': 'Izikhathi Zemisa',
    'footer.contact_info_footer': 'Imininingwane Yokuthintana',
  },
  sn: {
    // Navigation (ChiShona translations)
    'nav.home': 'Musha',
    'nav.about': 'Nesu',
    'nav.ministries': 'Mabasa',
    'nav.outreach': 'Rubatsiro',
    'nav.sacraments': 'Zvisakramente',
    'nav.events': 'Zviitiko',
    'nav.contact': 'Taura Nesu',
    'nav.giving': 'Kupa',
    
    // Homepage
    'home.welcome': 'Tinokugamuchirai kuSt. Patrick\'s Catholic Church',
    'home.subtitle': 'Makokoba, Bulawayo - Nharaunda Yedu Yekutenda',
    'home.urgent': 'Zvakakosha Zvekuzivisa',
    'home.mass_times': 'Nguva Dzemisa',
    'home.confession_times': 'Nguva Dzekureurura',
    'home.daily_mass': 'Misa Yemazuva Ese',
    'home.sunday_mass': 'Misa YeSvondo',
    'home.saturday_evening': 'Mugororo Manheru',
    'home.contact_us': 'Taura Nesu',
    'home.visit_us': 'Tishanyirei',
    
    // Mass Schedule
    'mass.weekdays': 'Mazuva Evhiki: 6:00 AM',
    'mass.saturday': 'Mugororo: 6:00 PM',
    'mass.sunday_early': 'Svondo: 6:00 AM',
    'mass.sunday_main': 'Svondo: 8:30 AM (Huru)',
    'mass.sunday_evening': 'Svondo: 5:00 PM',
    
    // Confession
    'confession.saturday': 'Mugororo: 5:00 PM - 5:45 PM',
    'confession.sunday': 'Svondo: Pamberi pemisa imwe neimwe',
    'confession.appointment': 'Kana nekukumbira nguva',
    
    // Outreach
    'outreach.title': 'Kururamisira Nharaunda Nerubatsiro',
    'outreach.caritas': 'Caritas Rubatsiro',
    'outreach.caritas_desc': 'Rubatsiro rwekudya, hutano, nedzidzo kuMakokoba neMzilikazi',
    'outreach.hiv_aids': 'Basa reHIV/AIDS',
    'outreach.hiv_aids_desc': 'Zvirongwa zvekubatsira avo vabatwa neHIV/AIDS',
    'outreach.education': 'Rubatsiro Rwedzidzo',
    'outreach.education_desc': 'Zvirongwa zvekudzidzisa nemikana yedzidzo yevechidiki',
    
    // Ministries
    'ministries.title': 'Mabasa eKereke',
    'ministries.choir': 'Kwaya yeKereke',
    'ministries.youth': 'Boka reVechidiki',
    'ministries.womens': 'Sangano reVakadzi',
    'ministries.mens': 'Sangano reVarume',
    'ministries.prayer': 'Mapoka eKunyengetera',
    
    // Sacraments
    'sacraments.title': 'Zvisakramente',
    'sacraments.baptism': 'Rubhabhatidzo',
    'sacraments.confirmation': 'Kusimbiswa',
    'sacraments.marriage': 'Muchato',
    'sacraments.rcia': 'RCIA (Kudzidziswa kweVakuru)',
    
    // Contact
    'contact.address': 'Kero',
    'contact.phone': 'Runhare',
    'contact.email': 'Email',
    'contact.parish_address': 'St. Patrick\'s Catholic Church, Makokoba, Bulawayo, Zimbabwe',
    
    // Giving
    'giving.title': 'Tsigira Kereke Yedu',
    'giving.subtitle': 'Zvipo zvenyu zvinobatsira kutsigira nharaunda yedu nemabasa ekubatsira',
    'giving.offertory': 'Chipo cheSvondo',
    'giving.online': 'Kupa neInternet',
    'giving.bank': 'Kutumira muBhanga',
    
    // Community
    'community.diaspora': 'Kona yeVari Kunze',
    'community.diaspora_desc': 'Nhau dzenhengo dziri kunze kwenyika',
    'community.gallery': 'Mifananidzo yeKereke',
    'community.events': 'Zviitiko Zvinotevera',
    
    // Language Toggle
    'lang.switch_to_ndebele': 'IsiNdebele',
    'lang.switch_to_english': 'English',
    'lang.switch_to_shona': 'ChiShona',
    
    // Prayers & Daily Devotion
    'prayers.title': 'Minyengetero Nekunamata Kwemazuva Ese',
    'prayers.subtitle': 'Tibatanidzei mukunyengetera uye muwane kudya kwemweya kuburikidza nemazwi aya matsvene nekuverenga kwemazuva ese',
    'prayers.daily_readings': 'Zviverenga Zveliturgical Zvemazuva Ano',
    'prayers.first_reading': 'Kuverenga Kwekutanga',
    'prayers.psalm': 'Pisarema Yekupindura',
    'prayers.gospel': 'Evhangeri',
    'prayers.reflection': 'Kufunga',
    'prayers.response': 'Mhinduro',
    'prayers.liturgical_season': 'Nguva Yeliturgical',
    'prayers.liturgical_color': 'Ruvara Rweliturgical',
    
    // Gallery
    'gallery.title': 'Mifananidzo Yeupenyu Hwekereke',
    'gallery.subtitle': 'Tichipemberera nharaunda yedu yekutenda kuburikidza nenguva dzemufaro, kunamata, uye ukadyidzana',
    'gallery.view_full': 'Ona Mifananidzo Yakazara',
    
    // Ministries
    'ministries.liturgical': 'Basa Reliturgical',
    'ministries.committees': 'Makomiti',
    'ministries.parish_council': 'Dare reKereke',
    'ministries.development_council': 'Dare reKusimudzira Kereke',
    'ministries.liturgical_committee': 'Komiti yeLiturgical',
    'ministries.catechists': 'Vadzidzisi veKatekisimu',
    
    // Admin
    'admin.login': 'Kupinda kweAdmin',
    'admin.dashboard': 'Bhodi reAdmin',
    'admin.manage_prayers': 'Tonga Minyengetero neZviverenga Zvemazuva Ese',
    'admin.add_prayer': 'Wedzera Munyengetero',
    'admin.edit_prayer': 'Gadzirisa Munyengetero',
    'admin.delete_prayer': 'Bvisa Munyengetero',
    'admin.prayer_title': 'Musoro weMunyengetero',
    'admin.prayer_text': 'Rugwaro rweMunyengetero',
    'admin.prayer_category': 'Chikamu',
    'admin.save': 'Chengetedza',
    'admin.cancel': 'Kanzura',
    
    // Authentication
    'auth.welcome_back': 'Tinokugamuchirai Zvakare',
    'auth.sign_in_church': 'Pinda muSt. Patrick\'s Catholic Church',
    'auth.parishioner_login': 'Kupinda kweNhengo',
    'auth.admin_login': 'Kupinda kweAdmin',
    'auth.email_phone_username': 'Email, Runhare, kana Zita reMushandisi',
    'auth.enter_credentials': 'Isa email yako, runhare, kana zita remushandisi',
    'auth.password': 'Password',
    'auth.enter_password': 'Isa password yako',
    'auth.sign_in': 'Pinda',
    'auth.authenticating': 'Tiri kusimbisa...',
    'auth.new_to_parish': 'Mutsva munharaunda yedu yekereke?',
    'auth.register_parishioner': 'Nyoresa seNhengo',
    'auth.help_text': 'Shandisa mabhatani ekukurumidza kumusoro kana uise ruzivo rwako.',
    
    // Registration
    'register.join_community': 'Joina Nharaunda Yedu Yekereke',
    'register.become_member': 'Nyoresa kuti uve nhengo yeSt. Patrick\'s Catholic Church',
    'register.personal_info': 'Ruzivo Rwemunhu',
    'register.first_name': 'Zita Rekutanga',
    'register.last_name': 'Mazita',
    'register.date_birth': 'Zuva Rekuzvarwa',
    'register.contact_info': 'Ruzivo Rwekubata',
    'register.email_address': 'Kero yeEmail',
    'register.phone_number': 'Nhamba yeRunhare',
    'register.address': 'Kero',
    'register.emergency_contact': 'Anobatwa panguva yeNjodzi (Hazvipinzwi)',
    'register.emergency_name': 'Zita reAnobatwa panguva yeNjodzi',
    'register.emergency_phone': 'Runhare rweAnobatwa panguva yeNjodzi',
    'register.account_security': 'Chengetedzo yeAccount',
    'register.confirm_password': 'Simbisa Password',
    'register.terms_conditions': 'Ndinobvuma Mitemo neMamiriro uye Privacy Policy yeSt. Patrick\'s Catholic Church',
    'register.fill_sample': 'Zadza Ruzivo rweMuenzaniso',
    'register.register_button': 'Nyoresa seNhengo',
    'register.registering': 'Tiri kunyoresa...',
    'register.already_account': 'Une account here?',
    'register.sign_in_here': 'Pinda Pano',
    'register.need_help': 'Unoda Rubatsiro?',
    'register.contact_office': 'Bata hofisi yekereke',
    
    // Form Validation
    'validation.required': 'Chinhu ichi chinodiwa',
    'validation.email_invalid': 'Ndapota isa email iri kutenderwa',
    'validation.phone_invalid': 'Ndapota isa nhamba yerunhare yeZimbabwe iri kutenderwa',
    'validation.password_min': 'Password inofanira kuve nemavara asingapfuure matanhatu',
    'validation.passwords_match': 'Passwords hadzifanani',
    'validation.age_minimum': 'Unofanira kuve nemakore asingapfuure gumi nematatu kuti unyorese',
    'validation.terms_required': 'Unofanira kubvuma mitemo nemamiriro',
    
    // Messages
    'message.registration_success': 'Kunyoresa kwabudirira! Ndapota pinda neruzivo rwako.',
    'message.login_success': 'Kupinda kwabudirira!',
    'message.login_failed': 'Ruzivo rusina kukwana. Ndapota edza zvakare.',
    'message.error_occurred': 'Pane chakakanganisa. Ndapota edza zvakare.',
    
    // Common UI
    'ui.loading': 'Tiri kutakura...',
    'ui.submit': 'Tumira',
    'ui.cancel': 'Kanzura',
    'ui.close': 'Vhara',
    'ui.edit': 'Gadzirisa',
    'ui.delete': 'Bvisa',
    'ui.view': 'Ona',
    'ui.back': 'Shure',
    'ui.next': 'Zvinotevera',
    'ui.previous': 'Zvakare',
    'ui.search': 'Tsvaga',
    'ui.filter': 'Sarudza',
    'ui.sort': 'Ronga',
    'ui.refresh': 'Vandudzira',
    'ui.logout': 'Buda',
    
    // Footer
    'footer.all_rights': 'Kodzero dzese dzakachengetedzwa',
    'footer.archdiocese': 'Chikamu cheArchdiocese yeBulawayo',
    'footer.support_mission': 'Tsigira Basa Redu',
    'footer.follow_us': 'Titeverei',
    'footer.quick_links': 'Zvisungo Zvekukurumidza',
    'footer.mass_times_footer': 'Nguva dzeMisa',
    'footer.contact_info_footer': 'Ruzivo Rwekubata',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
