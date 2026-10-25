/**
 * 字体加载管理器 - Google Fonts CDN版本
 * 优化字体加载性能和用户体验
 */

class FontManager {
  private static instance: FontManager | null = null;
  private loadedFonts: Set<string> = new Set();

  static getInstance(): FontManager {
    if (!FontManager.instance) {
      FontManager.instance = new FontManager();
    }
    return FontManager.instance;
  }

  /**
   * 检查字体是否已加载
   */
  isFontLoaded(family: string): boolean {
    return this.loadedFonts.has(family);
  }

  /**
   * 标记字体为已加载
   */
  markFontLoaded(family: string): void {
    this.loadedFonts.add(family);
    this.updateFontClasses();
  }

  /**
   * 更新字体加载状态类
   */
  private updateFontClasses(): void {
    const hasAllFonts = this.loadedFonts.size >= 3; // Inter, Lora, Noto Sans SC
    document.documentElement.classList.toggle('fonts-loaded', hasAllFonts);
    document.documentElement.classList.toggle('fonts-loading', !hasAllFonts);
  }

  /**
   * 初始化字体管理器
   */
  async init(): Promise<void> {
    // 设置初始状态
    document.documentElement.classList.add('fonts-loading');

    // 监听字体加载
    if ('fonts' in document) {
      try {
        // 检查字体是否已加载
        await this.checkFontsLoaded();
      } catch (error) {
        console.warn('字体检查失败:', error);
        // 即使失败也标记为已加载，避免阻塞
        this.markAllFontsLoaded();
      }
    } else {
      // 浏览器不支持字体API，直接标记为已加载
      this.markAllFontsLoaded();
    }
  }

  /**
   * 检查字体加载状态
   */
  private async checkFontsLoaded(): Promise<void> {
    const fonts = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '600' },
      { family: 'Lora', weight: '400' },
      { family: 'Noto Sans SC', weight: '400' },
    ];

    for (const font of fonts) {
      try {
        const isLoaded = await this.isFontAvailable(font.family, font.weight);
        if (isLoaded) {
          this.markFontLoaded(font.family);
        }
      } catch (error) {
        console.warn(`检查字体失败: ${font.family}`, error);
      }
    }

    this.updateFontClasses();
  }

  /**
   * 检查字体是否可用
   */
  private async isFontAvailable(family: string, _weight: string): Promise<boolean> {
    return new Promise(resolve => {
      const testText = 'abcdefghijklmnopqrstuvwxyz';
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        resolve(false);
        return;
      }

      // 测试默认字体
      context.font = `72px monospace`;
      const defaultWidth = context.measureText(testText).width;

      // 测试目标字体
      context.font = `72px ${family}`;
      const targetWidth = context.measureText(testText).width;

      resolve(defaultWidth !== targetWidth);
    });
  }

  /**
   * 标记所有字体为已加载
   */
  private markAllFontsLoaded(): void {
    this.loadedFonts.add('Inter');
    this.loadedFonts.add('Lora');
    this.loadedFonts.add('Noto Sans SC');
    this.updateFontClasses();
  }

  /**
   * 获取字体加载统计
   */
  getLoadingStats(): { loaded: number; total: number } {
    return {
      loaded: this.loadedFonts.size,
      total: 3,
    };
  }
}

// 导出单例实例
export const fontManager = FontManager.getInstance();
