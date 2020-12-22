import { EventsTypes } from 'visualne/types/events';
import { PluginParams } from 'visualne/types/core/plugin';
import { Context, EPointerButton, NodeEditor, Plugin } from 'visualne';
import { Position, Size, applyTransform, cleanSelectionArea, drawSelectionArea } from './utils';

export interface SelectionParams extends PluginParams {
  selectionArea?: {
    className?: string;
  };
  selectionMode?: {
    className?: string;
  };
  enabled?: boolean;
  mode?: [string, string];
}

export declare type SelectionEvents = EventsTypes & {
  multiselection: boolean;
};

class Selection extends Plugin {
  name: string = 'selection-plugin';

  constructor(editor: NodeEditor, params: SelectionParams = { enabled: true }) {
    super(editor);

    this.initialize(editor, params);
  }

  protected initialize(editor: NodeEditor, params: SelectionParams): void
  {
    editor.bind('multiselection');

    let accumulate = false
    let pressing = false
    const selection: [Position, Position] = [{ x: 0, y: 0 }, { x: 0, y: 0 }];

    const selectionArea = document.createElement('div');
    selectionArea.classList.add('selection-area');
    selectionArea.style.position = 'absolute';
    selectionArea.style.boxSizing = 'border-box';
    selectionArea.style.pointerEvents = 'none';
    cleanSelectionArea(selectionArea);

    const selectionMode = document.createElement('div');
    selectionMode.classList.add('selection-mode');
    selectionMode.style.position = 'absolute';
    selectionMode.style.pointerEvents = 'none';
    selectionMode.innerText = (params.mode ?? [])[0] ?? 'Single selection mode';

    const canvas = editor.view.container.firstElementChild as HTMLDivElement

    const getNodesFromSelectionArea = () => {
      if (!params.enabled) {
        return []
      }

      const { x: translateX, y: translateY, k: scale } = editor.view.area.transform
      const areaStart = applyTransform(translateX, translateY, scale, { ...selection[0] });
      const areaEnd = applyTransform(translateX, translateY, scale, { ...selection[1] });

      if (areaEnd.x < areaStart.x) {
        const num = areaStart.x
        areaStart.x = areaEnd.x
        areaEnd.x = num
      }
      if (areaEnd.y < areaStart.y) {
        const num = areaStart.y
        areaStart.y = areaEnd.y
        areaEnd.y = num
      }

      return editor.nodes.filter(item => {
        const [x, y] = item.position;

        return (x >= areaStart.x && x <= areaEnd.x && y >= areaStart.y && y <= areaEnd.y);
      });
    }

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!params.enabled) {
        return
      }

      if (e.button !== EPointerButton.LEFT_CLICK) {
        return
      }
      if (!e.ctrlKey) {
        return
      }

      pressing = true

      canvas.style.pointerEvents = 'none'
      Array.from(canvas.querySelectorAll('path')).forEach(item => {
        (item as SVGElement).style.pointerEvents = 'none'
      })

      cleanSelectionArea(selectionArea);

      selection[0] = { x: e.offsetX, y: e.offsetY };
      selection[1] = { x: e.offsetX, y: e.offsetY }
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const selectedNodes = getNodesFromSelectionArea()

      pressing = false

      canvas.style.pointerEvents = 'auto'
      Array.from(canvas.querySelectorAll('path')).forEach(item => {
        (item as SVGElement).style.pointerEvents = 'auto'
      })

      cleanSelectionArea(selectionArea)
      selection[0] = { x: 0, y: 0 }
      selection[1] = { x: 0, y: 0 }

      if (!params.enabled) {
        return
      }
      if (!e.ctrlKey) {
        return
      }

      selectedNodes.forEach((node) => {
        editor.selectNode(node, accumulate)
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!params.enabled) {
        return
      }
      if (!e.ctrlKey) {
        return
      }
      if (!pressing) {
        return
      }
      if (editor.selected.list.length > 0) {
        return
      }

      selection[1] = { x: e.offsetX, y: e.offsetY }

      const size: Size = {
        width: Math.abs(selection[1].x - selection[0].x),
        height: Math.abs(selection[1].y - selection[0].y)
      }
      const position = { ...selection[0] }

      if (selection[1].x < selection[0].x) {
        position.x = selection[1].x
      }
      if (selection[1].y < selection[0].y) {
        position.y = selection[1].y
      }

      drawSelectionArea(selectionArea, position, size)
    }

    {
      const className = params.selectionArea?.className;
      if (className) {
        selectionMode.classList.add(...className.split(' '));
      } else {
        selectionArea.style.backgroundColor = '#E3F2FD';
        selectionArea.style.border = 'solid 1px #42A5F5';
        selectionArea.style.borderRadius = '4px';
      }
    }

    {
      const className = params.selectionMode?.className;
      if (className) {
        selectionMode.classList.add(...className.split(' '));
      } else {
        selectionMode.style.top = '16px';
        selectionMode.style.left = '16px';
      }
    }

    editor.view.container.style.position = 'relative';
    editor.view.container.appendChild(selectionArea);
    editor.view.container.appendChild(selectionMode);

    editor.view.container.addEventListener('mousedown', handleMouseDown);
    editor.view.container.addEventListener('mouseup', handleMouseUp);
    editor.view.container.addEventListener('mouseout', handleMouseUp);
    editor.view.container.addEventListener('mousemove', handleMouseMove);

    editor.on('destroy', () => {
      editor.view.container.removeChild(selectionArea);
      editor.view.container.removeChild(selectionMode);

      editor.view.container.removeEventListener('mousedown', handleMouseDown);
      editor.view.container.removeEventListener('mouseup', handleMouseUp);
      editor.view.container.removeEventListener('mouseout', handleMouseUp);
      editor.view.container.removeEventListener('mousemove', handleMouseMove);
    });

    (editor as Context<SelectionEvents & EventsTypes>).on('multiselection', enabled => {
      params.enabled = enabled;
    });

    editor.on('keydown', (e) => {
      if (e.ctrlKey) {
        accumulate = true;
        selectionMode.innerText = (params.mode ?? [])[1] ?? 'Single selection mode';
      }
    });

    editor.on('keyup', () => {
      if (accumulate) {
        accumulate = false
        selectionMode.innerText = (params.mode ?? [])[0] ?? 'Single selection mode'
      }
    });

    editor.on('translate', () => {
      return !accumulate
    });

  }

}

export const SelectionPlugin = Selection;
