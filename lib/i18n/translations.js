/**
 * Localization Configuration
 * Supports Bengali (bn-BD) and English (en-BD)
 */

export const locales = ['en-BD', 'bn-BD']
export const defaultLocale = 'en-BD'

export const translations = {
  'en-BD': {
    nav: {
      home: 'Home',
      products: 'Products',
      track: 'Track',
      dashboard: 'Dashboard',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      loginRegister: 'Login / Register',
      profile: 'Profile',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      phone: 'Phone Number',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      backToLogin: 'Back to Login',
      sendResetLink: 'Send Reset Link',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
    },
    home: {
      hero: {
        title: 'Track Products with Blockchain',
        subtitle: 'Secure, transparent, and tamper-proof supply chain tracking system powered by blockchain technology.',
      },
      actions: {
        register: {
          title: 'Register Product',
          description: 'Add new products and generate QR codes for tracking.',
        },
        track: {
          title: 'Update Status',
          description: 'Record supply chain events and location updates.',
        },
        verify: {
          title: 'Verify Products',
          description: 'Scan QR codes or enter product IDs to verify authenticity.',
        },
      },
      features: {
        register: {
          title: 'Register Products',
          subtitle: 'Generate QR codes',
        },
        track: {
          title: 'Track Movement',
          subtitle: 'Monitor supply chain',
        },
        verify: {
          title: 'Verify Authenticity',
          subtitle: 'Scan QR codes',
        },
      },
      cta: {
        getStarted: 'Get Started - Sign In',
      },
    },
    product: {
      name: 'Product Name',
      category: 'Category',
      origin: 'Origin',
      status: 'Status',
      price: 'Price',
      description: 'Description',
      manufactureDate: 'Manufacture Date',
      expiryDate: 'Expiry Date',
      batchNumber: 'Batch Number',
      creator: 'Producer',
      qrCode: 'QR Code',
      downloadQR: 'Download QR',
      printQR: 'Print QR Code',
      verification: 'Verification',
      verified: 'Product Verified',
      productId: 'Product ID',
      productDetails: 'Product Details',
      supplyChain: 'Supply Chain',
      registerNew: 'Register New Product',
      allProducts: 'All Products',
      myProducts: 'My Products',
      recentProducts: 'Recent Products',
      noProducts: 'No products found',
      searchProducts: 'Search products...',
    },
    timeline: {
      title: 'Supply Chain Timeline',
      event: 'Event',
      location: 'Location',
      timestamp: 'Time',
      actor: 'Performed By',
      eventType: 'Event Type',
      details: 'Details',
      noEvents: 'No events recorded yet',
    },
    watchlist: {
      watch: 'Watch Product',
      watching: 'Watching',
      unwatch: 'Unwatch',
      notifyEmail: 'Email Notifications',
      notifyPush: 'Push Notifications',
      myWatchlist: 'My Watchlist',
      addToWatchlist: 'Add to Watchlist',
      removeFromWatchlist: 'Remove from Watchlist',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome',
      overview: 'Overview',
      statistics: 'Statistics',
      recentActivity: 'Recent Activity',
      totalProducts: 'Total Products',
      activeProducts: 'Active Products',
      totalEvents: 'Total Events',
      pendingVerification: 'Pending Verification',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      submit: 'Submit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      copyLink: 'Copy Link',
      scanToVerify: 'Scan to verify',
      showMore: 'Show More',
      showLess: 'Show Less',
      viewAll: 'View All',
      noData: 'No data available',
      selectOption: 'Select an option',
      required: 'Required',
      optional: 'Optional',
      yes: 'Yes',
      no: 'No',
    },
    roles: {
      FARMER: 'Farmer',
      DISTRIBUTOR: 'Distributor',
      RETAILER: 'Retailer',
      CONSUMER: 'Consumer',
      ADMIN: 'Admin',
    },
    status: {
      CREATED: 'Created',
      IN_TRANSIT: 'In Transit',
      DELIVERED: 'Delivered',
      VERIFIED: 'Verified',
      PENDING: 'Pending',
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
    },
    categories: {
      VEGETABLES: 'Vegetables',
      FRUITS: 'Fruits',
      GRAINS: 'Grains',
      DAIRY: 'Dairy',
      MEAT: 'Meat',
      FISH: 'Fish',
      OTHER: 'Other',
    },
    messages: {
      productRegistered: 'Product registered successfully',
      eventRecorded: 'Event recorded successfully',
      updateSuccess: 'Updated successfully',
      deleteSuccess: 'Deleted successfully',
      copySuccess: 'Copied to clipboard',
      loginSuccess: 'Logged in successfully',
      logoutSuccess: 'Logged out successfully',
      registrationSuccess: 'Registration successful',
      errorOccurred: 'An error occurred',
      pleaseLogin: 'Please login to continue',
      accessDenied: 'Access denied',
      notFound: 'Not found',
      invalidInput: 'Invalid input',
      requiredField: 'This field is required',
    },
    currency: {
      symbol: '৳',
      code: 'BDT',
      format: 'en-BD',
    },
  },
  'bn-BD': {
    nav: {
      home: 'হোম',
      products: 'পণ্য',
      track: 'ট্র্যাক',
      dashboard: 'ড্যাশবোর্ড',
    },
    auth: {
      login: 'লগইন',
      logout: 'লগআউট',
      register: 'নিবন্ধন',
      loginRegister: 'লগইন / নিবন্ধন',
      profile: 'প্রোফাইল',
      email: 'ইমেইল',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      name: 'নাম',
      phone: 'ফোন নম্বর',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      resetPassword: 'পাসওয়ার্ড রিসেট করুন',
      backToLogin: 'লগইনে ফিরে যান',
      sendResetLink: 'রিসেট লিঙ্ক পাঠান',
      createAccount: 'অ্যাকাউন্ট তৈরি করুন',
      alreadyHaveAccount: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
      dontHaveAccount: 'অ্যাকাউন্ট নেই?',
    },
    home: {
      hero: {
        title: 'ব্লকচেইন দিয়ে পণ্য ট্র্যাক করুন',
        subtitle: 'ব্লকচেইন প্রযুক্তি দ্বারা চালিত সুরক্ষিত, স্বচ্ছ এবং টেম্পার-প্রুফ সাপ্লাই চেইন ট্র্যাকিং সিস্টেম।',
      },
      actions: {
        register: {
          title: 'পণ্য নিবন্ধন করুন',
          description: 'নতুন পণ্য যোগ করুন এবং ট্র্যাকিংয়ের জন্য QR কোড তৈরি করুন।',
        },
        track: {
          title: 'স্ট্যাটাস আপডেট করুন',
          description: 'সাপ্লাই চেইন ইভেন্ট এবং অবস্থান আপডেট রেকর্ড করুন।',
        },
        verify: {
          title: 'পণ্য যাচাই করুন',
          description: 'সত্যতা যাচাই করতে QR কোড স্ক্যান করুন বা পণ্য আইডি লিখুন।',
        },
      },
      features: {
        register: {
          title: 'পণ্য নিবন্ধন করুন',
          subtitle: 'QR কোড তৈরি করুন',
        },
        track: {
          title: 'মুভমেন্ট ট্র্যাক করুন',
          subtitle: 'সাপ্লাই চেইন পর্যবেক্ষণ করুন',
        },
        verify: {
          title: 'সত্যতা যাচাই করুন',
          subtitle: 'QR কোড স্ক্যান করুন',
        },
      },
      cta: {
        getStarted: 'শুরু করুন - সাইন ইন করুন',
      },
    },
    product: {
      name: 'পণ্যের নাম',
      category: 'বিভাগ',
      origin: 'উৎস',
      status: 'অবস্থা',
      price: 'মূল্য',
      description: 'বর্ণনা',
      manufactureDate: 'উৎপাদন তারিখ',
      expiryDate: 'মেয়াদ শেষের তারিখ',
      batchNumber: 'ব্যাচ নম্বর',
      creator: 'উৎপাদক',
      qrCode: 'কিউআর কোড',
      downloadQR: 'কিউআর ডাউনলোড করুন',
      printQR: 'কিউআর কোড প্রিন্ট করুন',
      verification: 'যাচাইকরণ',
      verified: 'পণ্য যাচাই করা হয়েছে',
      productId: 'পণ্য আইডি',
      productDetails: 'পণ্যের বিবরণ',
      supplyChain: 'সাপ্লাই চেইন',
      registerNew: 'নতুন পণ্য নিবন্ধন করুন',
      allProducts: 'সমস্ত পণ্য',
      myProducts: 'আমার পণ্য',
      recentProducts: 'সাম্প্রতিক পণ্য',
      noProducts: 'কোনো পণ্য পাওয়া যায়নি',
      searchProducts: 'পণ্য খুঁজুন...',
    },
    timeline: {
      title: 'সাপ্লাই চেইন টাইমলাইন',
      event: 'ঘটনা',
      location: 'অবস্থান',
      timestamp: 'সময়',
      actor: 'সম্পাদক',
      eventType: 'ইভেন্টের ধরন',
      details: 'বিস্তারিত',
      noEvents: 'এখনও কোনো ইভেন্ট রেকর্ড করা হয়নি',
    },
    watchlist: {
      watch: 'পণ্য ওয়াচ করুন',
      watching: 'ওয়াচ করছেন',
      unwatch: 'আনওয়াচ',
      notifyEmail: 'ইমেল বিজ্ঞপ্তি',
      notifyPush: 'পুশ বিজ্ঞপ্তি',
      myWatchlist: 'আমার ওয়াচলিস্ট',
      addToWatchlist: 'ওয়াচলিস্টে যোগ করুন',
      removeFromWatchlist: 'ওয়াচলিস্ট থেকে সরান',
    },
    dashboard: {
      title: 'ড্যাশবোর্ড',
      welcome: 'স্বাগতম',
      overview: 'সংক্ষিপ্ত বিবরণ',
      statistics: 'পরিসংখ্যান',
      recentActivity: 'সাম্প্রতিক কার্যকলাপ',
      totalProducts: 'মোট পণ্য',
      activeProducts: 'সক্রিয় পণ্য',
      totalEvents: 'মোট ইভেন্ট',
      pendingVerification: 'যাচাইকরণ মুলতুবি',
    },
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি',
      success: 'সফল',
      warning: 'সতর্কতা',
      info: 'তথ্য',
      cancel: 'বাতিল',
      save: 'সংরক্ষণ',
      delete: 'মুছুন',
      edit: 'সম্পাদনা',
      view: 'দেখুন',
      download: 'ডাউনলোড',
      upload: 'আপলোড',
      submit: 'জমা দিন',
      close: 'বন্ধ করুন',
      back: 'পিছনে',
      next: 'পরবর্তী',
      previous: 'পূর্ববর্তী',
      confirm: 'নিশ্চিত করুন',
      search: 'অনুসন্ধান',
      filter: 'ফিল্টার',
      sort: 'সাজান',
      copyLink: 'লিঙ্ক কপি করুন',
      scanToVerify: 'যাচাই করতে স্ক্যান করুন',
      showMore: 'আরও দেখুন',
      showLess: 'কম দেখুন',
      viewAll: 'সব দেখুন',
      noData: 'কোন তথ্য নেই',
      selectOption: 'একটি বিকল্প নির্বাচন করুন',
      required: 'আবশ্যক',
      optional: 'ঐচ্ছিক',
      yes: 'হ্যাঁ',
      no: 'না',
    },
    roles: {
      FARMER: 'কৃষক',
      DISTRIBUTOR: 'পরিবেশক',
      RETAILER: 'খুচরা বিক্রেতা',
      CONSUMER: 'ভোক্তা',
      ADMIN: 'অ্যাডমিন',
    },
    status: {
      CREATED: 'তৈরি হয়েছে',
      IN_TRANSIT: 'ট্রানজিটে',
      DELIVERED: 'বিতরণ করা হয়েছে',
      VERIFIED: 'যাচাই করা হয়েছে',
      PENDING: 'মুলতুবি',
      ACTIVE: 'সক্রিয়',
      INACTIVE: 'নিষ্ক্রিয়',
    },
    categories: {
      VEGETABLES: 'সবজি',
      FRUITS: 'ফল',
      GRAINS: 'শস্য',
      DAIRY: 'দুগ্ধজাত',
      MEAT: 'মাংস',
      FISH: 'মাছ',
      OTHER: 'অন্যান্য',
    },
    messages: {
      productRegistered: 'পণ্য সফলভাবে নিবন্ধিত হয়েছে',
      eventRecorded: 'ইভেন্ট সফলভাবে রেকর্ড করা হয়েছে',
      updateSuccess: 'সফলভাবে আপডেট করা হয়েছে',
      deleteSuccess: 'সফলভাবে মুছে ফেলা হয়েছে',
      copySuccess: 'ক্লিপবোর্ডে কপি করা হয়েছে',
      loginSuccess: 'সফলভাবে লগইন হয়েছে',
      logoutSuccess: 'সফলভাবে লগআউট হয়েছে',
      registrationSuccess: 'নিবন্ধন সফল হয়েছে',
      errorOccurred: 'একটি ত্রুটি ঘটেছে',
      pleaseLogin: 'অনুগ্রহ করে লগইন করুন',
      accessDenied: 'অ্যাক্সেস অস্বীকৃত',
      notFound: 'পাওয়া যায়নি',
      invalidInput: 'অবৈধ ইনপুট',
      requiredField: 'এই ক্ষেত্রটি আবশ্যক',
    },
    currency: {
      symbol: '৳',
      code: 'BDT',
      format: 'bn-BD',
    },
  },
}

/**
 * Get translation by key
 * @param {string} locale - Locale code
 * @param {string} key - Translation key (e.g., 'common.home')
 * @returns {string} Translated text
 */
export function t(locale, key) {
  const keys = key.split('.')
  let value = translations[locale] || translations[defaultLocale]
  
  for (const k of keys) {
    value = value[k]
    if (!value) return key
  }
  
  return value
}

/**
 * Format currency
 * @param {number} amount - Amount
 * @param {string} locale - Locale code
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, locale = defaultLocale) {
  const { code, format } = translations[locale].currency
  return new Intl.NumberFormat(format, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date
 * @param {Date|string} date - Date
 * @param {string} locale - Locale code
 * @returns {string} Formatted date
 */
export function formatDate(date, locale = defaultLocale) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
