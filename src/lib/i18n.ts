// src/lib/i18n.ts
export const messages = {
  zh: {
    'button.support': '支持',
    'aria.heart': '为这个独立项目送一口小小能量',
    'tip.header': '✨ 能量注入中...',
    'thanks.message': '已收到心意 💌',
    'pay.instruction': '请使用微信或支付宝扫描二维码',
    'pay.wechat': '请使用微信扫描',
    'pay.alipay': '请使用支付宝扫描',
  },
  en: {
    'button.support': 'Support',
    'aria.heart': 'Send a little energy to this project',
    'tip.header': '✨ Injecting energy...',
    'thanks.message': 'Thanks for your support 💌',
    'pay.instruction': 'Please scan the QR code with WeChat or Alipay',
    'pay.wechat': 'Please scan with WeChat',
    'pay.alipay': 'Please scan with Alipay',
  },
} as const;

/**
 * Simple translation function with graceful fallback.
 * If the key is missing in the selected locale, it falls back to Chinese (zh),
 * then to the key itself.
 */
export function t(
  key: keyof (typeof messages)['zh'],
  locale: keyof typeof messages = 'zh'
): string {
  if (messages[locale] && key in messages[locale]) {
    return messages[locale][key] as string;
  }
  // fallback to Chinese
  if (key in messages['zh']) {
    return messages['zh'][key] as string;
  }
  // final fallback – return the key (so UI never blanks)
  return key;
}
