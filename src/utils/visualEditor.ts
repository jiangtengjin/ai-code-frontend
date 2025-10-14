/**
 * 可视化编辑器：在 iframe 内启用元素 hover/点击高亮，并通过 postMessage 与主站通信
 * 同域前提下，主站可通过 window.addEventListener('message', ...) 接收选中元素信息
 */
export type SelectedElementInfo = {
  selector: string;
  tagName: string;
  text: string;
  id?: string;
  classList?: string[];
};

type VisualEditorInstance = {
  enable: () => void;
  disable: () => void;
  clearSelected: () => void;
  getSelected: () => SelectedElementInfo | null;
};

function buildSelectorPath(el: Element): string {
  // 生成简洁的 CSS 选择器路径：优先使用 id，其次类名，最后层级
  const parts: string[] = [];
  let node: Element | null = el;

  while (node && node.nodeType === 1) {
    let part = node.tagName.toLowerCase();
    const id = (node as HTMLElement).id;
    if (id) {
      part += `#${CSS.escape(id)}`;
      parts.unshift(part);
      break;
    }
    const className = (node as HTMLElement).className;
    if (className && typeof className === 'string') {
      const firstClass = className.trim().split(/\s+/)[0];
      if (firstClass) {
        part += `.${CSS.escape(firstClass)}`;
      }
    }
    // 同级索引避免选择到其他元素
    const parentEl = (node as any).parentElement as Element | null;
    if (parentEl) {
      const childrenList = Array.from((parentEl as any).children as Element[]);
      const siblings: Element[] = childrenList.filter((c: Element) => c.tagName === (node as Element).tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(node as Element);
        part += `:nth-of-type(${index + 1})`;
      }
    }
    parts.unshift(part);
    node = parentEl;
  }
  return parts.join(' > ');
}

export function initVisualEditor(
  iframeEl: HTMLIFrameElement,
  onSelect?: (info: SelectedElementInfo) => void
): VisualEditorInstance {
  let enabled = false;
  let selectedEl: Element | null = null;
  let hoverStyleEl: HTMLStyleElement | null = null;
  let clickStyleEl: HTMLStyleElement | null = null;

  const getDoc = () => {
    try {
      const doc = iframeEl.contentDocument;
      return doc || null;
    } catch {
      return null;
    }
  };

  const injectHoverStyles = () => {
    const doc = getDoc();
    if (!doc) return;
    if (hoverStyleEl) return;
    hoverStyleEl = doc.createElement('style');
    hoverStyleEl.setAttribute('data-visual-editor-style', 'hover');
    hoverStyleEl.textContent = `
      *:hover {
        outline: 2px dashed #1890ff !important;
        cursor: crosshair !important;
      }
    `;
    doc.head.appendChild(hoverStyleEl);
  };

  const injectClickStyles = () => {
    const doc = getDoc();
    if (!doc) return;
    if (clickStyleEl) return;
    clickStyleEl = doc.createElement('style');
    clickStyleEl.setAttribute('data-visual-editor-style', 'click');
    clickStyleEl.textContent = `
      .__ve-selected__ {
        outline: 2px solid #0958d9 !important;
      }
    `;
    doc.head.appendChild(clickStyleEl);
  };

  const clearSelected = () => {
    const doc = getDoc();
    selectedEl?.classList.remove('__ve-selected__');
    selectedEl = null;
    if (doc) {
      const prev = doc.querySelector('.__ve-selected__');
      prev?.classList.remove('__ve-selected__');
    }
  };

  const handleMouseOver = (e: MouseEvent) => {
    // 不处理
  };

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as Element;
    if (!target) return;
    // 清除旧选择并设置新选择
    const doc = getDoc();
    if (!doc) return;
    doc.querySelectorAll('.__ve-selected__').forEach((el) => el.classList.remove('__ve-selected__'));
    selectedEl = target;
    selectedEl.classList.add('__ve-selected__');

    const info: SelectedElementInfo = {
      selector: buildSelectorPath(target),
      tagName: target.tagName.toLowerCase(),
      text: (target as HTMLElement).innerText?.slice(0, 200) || '',
      id: (target as HTMLElement).id || undefined,
      classList: Array.from(target.classList),
    };

    // 发送给主站（同域）
    try {
      // 同域环境下，iframe 的 parent 即主站
      iframeEl.contentWindow?.parent?.postMessage(
        { type: 'visual-edit-select', payload: info },
        '*'
      );
    } catch {
      // ignore
    }

    onSelect && onSelect(info);
  };

  const enable = () => {
    if (enabled) return;
    const doc = getDoc();
    if (!doc) return;
    enabled = true;
    injectHoverStyles();
    injectClickStyles();
    doc.addEventListener('click', handleClick, true);
    doc.addEventListener('mouseover', handleMouseOver, true);
  };

  const disable = () => {
    if (!enabled) return;
    const doc = getDoc();
    enabled = false;
    clearSelected();
    if (doc) {
      doc.removeEventListener('click', handleClick, true);
      doc.removeEventListener('mouseover', handleMouseOver, true);
      // 保留样式文件不移除，避免闪烁；如需彻底清理可取消注释：
      // hoverStyleEl?.remove();
      // clickStyleEl?.remove();
      // hoverStyleEl = null;
      // clickStyleEl = null;
    }
  };

  const getSelected = (): SelectedElementInfo | null => {
    if (!selectedEl) return null;
    return {
      selector: buildSelectorPath(selectedEl),
      tagName: selectedEl.tagName.toLowerCase(),
      text: (selectedEl as HTMLElement).innerText?.slice(0, 200) || '',
      id: (selectedEl as HTMLElement).id || undefined,
      classList: Array.from(selectedEl.classList),
    };
  };

  return {
    enable,
    disable,
    clearSelected,
    getSelected,
  };
}