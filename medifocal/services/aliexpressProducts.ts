/**
 * AliExpress Product API Service
 * Handles product search and import from AliExpress
 */

import { getValidAccessToken } from './aliexpressOAuth';

const ALIEXPRESS_API_BASE = 'https://api-sg.aliexpress.com/rest';

export interface AliExpressProduct {
  productId: string;
  productTitle: string;
  productUrl: string;
  productImageUrl: string;
  originalPrice: string;
  salePrice: string;
  currency: string;
  discount: string;
  storeName: string;
  storeUrl: string;
  shippingInfo: {
    shipTo: string;
    estimatedDeliveryTime: string;
    shippingCost: string;
  };
  rating: {
    averageStar: string;
    totalValidNum: string;
  };
  promotionInfo?: {
    promotionPrice: string;
    promotionStartTime: string;
    promotionEndTime: string;
  };
}

export interface AliExpressSearchResult {
  products: AliExpressProduct[];
  totalResults: number;
  pageNo: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Search AliExpress products
 */
export async function searchAliExpressProducts(
  keyword: string,
  pageNo: number = 1,
  pageSize: number = 20
): Promise<AliExpressSearchResult> {
  const accessToken = await getValidAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated with AliExpress. Please authorize first.');
  }

  // Use AliExpress Product Search API
  // Note: The actual API endpoint and parameters may vary based on AliExpress API documentation
  const apiName = 'aliexpress.affiliate.product.query';
  
  const params = {
    access_token: accessToken,
    app_key: import.meta.env.VITE_ALIEXPRESS_APP_KEY || '',
    keywords: keyword,
    page_no: pageNo.toString(),
    page_size: pageSize.toString(),
    locale: 'en_US',
    currency: 'AUD',
    target_currency: 'AUD',
    target_language: 'en',
    sort: 'SALE_PRICE_ASC', // Sort by price ascending
    fields: 'product_id,product_title,product_url,product_image_url,original_price,sale_price,currency,discount,store_name,store_url,shipping_info,rating,promotion_info'
  };

  try {
    // Create signature for the request
    const timestamp = Date.now().toString();
    const signature = await createApiSignature(
      import.meta.env.VITE_ALIEXPRESS_APP_KEY || '',
      import.meta.env.VITE_ALIEXPRESS_APP_SECRET || '',
      apiName,
      params,
      timestamp
    );

    const url = `${ALIEXPRESS_API_BASE}/${apiName}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        timestamp,
        sign: signature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AliExpress API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Handle AliExpress API response format
    if (data.error_response) {
      throw new Error(`AliExpress API error: ${data.error_response.msg || 'Unknown error'}`);
    }

    // Parse response
    const result = data.aliexpress_affiliate_product_query_response?.result || data;
    
    const products: AliExpressProduct[] = (result.products?.aeop_ae_product_display_dto || []).map((item: any) => ({
      productId: item.product_id?.toString() || '',
      productTitle: item.product_title || '',
      productUrl: item.product_url || '',
      productImageUrl: item.product_image_url || '',
      originalPrice: item.original_price || '',
      salePrice: item.sale_price || '',
      currency: item.currency || 'AUD',
      discount: item.discount || '',
      storeName: item.store_name || '',
      storeUrl: item.store_url || '',
      shippingInfo: {
        shipTo: item.shipping_info?.ship_to || '',
        estimatedDeliveryTime: item.shipping_info?.estimated_delivery_time || '',
        shippingCost: item.shipping_info?.shipping_cost || ''
      },
      rating: {
        averageStar: item.rating?.average_star || '',
        totalValidNum: item.rating?.total_valid_num || ''
      },
      promotionInfo: item.promotion_info ? {
        promotionPrice: item.promotion_info.promotion_price || '',
        promotionStartTime: item.promotion_info.promotion_start_time || '',
        promotionEndTime: item.promotion_info.promotion_end_time || ''
      } : undefined
    }));

    return {
      products,
      totalResults: parseInt(result.total_result_count || '0', 10),
      pageNo: parseInt(result.page_no || pageNo.toString(), 10),
      pageSize: parseInt(result.page_size || pageSize.toString(), 10),
      hasMore: products.length === pageSize
    };
  } catch (error: any) {
    console.error('Error searching AliExpress products:', error);
    throw error;
  }
}

/**
 * Get product details by product ID
 */
export async function getAliExpressProductDetails(productId: string): Promise<AliExpressProduct | null> {
  const accessToken = await getValidAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated with AliExpress. Please authorize first.');
  }

  // Use AliExpress Product Details API
  const apiName = 'aliexpress.affiliate.productdetail.get';
  
  const params = {
    access_token: accessToken,
    app_key: import.meta.env.VITE_ALIEXPRESS_APP_KEY || '',
    product_id: productId,
    locale: 'en_US',
    currency: 'AUD',
    target_currency: 'AUD',
    target_language: 'en',
    fields: 'product_id,product_title,product_url,product_image_url,original_price,sale_price,currency,discount,store_name,store_url,shipping_info,rating,promotion_info,product_description,product_images'
  };

  try {
    const timestamp = Date.now().toString();
    const signature = await createApiSignature(
      import.meta.env.VITE_ALIEXPRESS_APP_KEY || '',
      import.meta.env.VITE_ALIEXPRESS_APP_SECRET || '',
      apiName,
      params,
      timestamp
    );

    const url = `${ALIEXPRESS_API_BASE}/${apiName}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        timestamp,
        sign: signature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AliExpress API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error_response) {
      throw new Error(`AliExpress API error: ${data.error_response.msg || 'Unknown error'}`);
    }

    const product = data.aliexpress_affiliate_productdetail_get_response?.result || data;
    
    if (!product) {
      return null;
    }

    return {
      productId: product.product_id?.toString() || productId,
      productTitle: product.product_title || '',
      productUrl: product.product_url || '',
      productImageUrl: product.product_image_url || '',
      originalPrice: product.original_price || '',
      salePrice: product.sale_price || '',
      currency: product.currency || 'AUD',
      discount: product.discount || '',
      storeName: product.store_name || '',
      storeUrl: product.store_url || '',
      shippingInfo: {
        shipTo: product.shipping_info?.ship_to || '',
        estimatedDeliveryTime: product.shipping_info?.estimated_delivery_time || '',
        shippingCost: product.shipping_info?.shipping_cost || ''
      },
      rating: {
        averageStar: product.rating?.average_star || '',
        totalValidNum: product.rating?.total_valid_num || ''
      },
      promotionInfo: product.promotion_info ? {
        promotionPrice: product.promotion_info.promotion_price || '',
        promotionStartTime: product.promotion_info.promotion_start_time || '',
        promotionEndTime: product.promotion_info.promotion_end_time || ''
      } : undefined
    };
  } catch (error: any) {
    console.error('Error getting AliExpress product details:', error);
    throw error;
  }
}

/**
 * Create API signature for AliExpress requests
 */
async function createApiSignature(
  appKey: string,
  appSecret: string,
  apiName: string,
  params: Record<string, string>,
  timestamp: string
): Promise<string> {
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(params).sort();
  const sortedParams = sortedKeys
    .map(key => `${key}${params[key]}`)
    .join('');

  // Create string to sign
  const stringToSign = `${apiName}${sortedParams}${timestamp}${appSecret}`;

  // Create HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(appSecret);
  const messageData = encoder.encode(stringToSign);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex.toUpperCase();
}



