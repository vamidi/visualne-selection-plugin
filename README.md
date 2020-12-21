# visualne-selection-plugin

VisualNE plugin to select multiple nodes at once.

![Capture](installation/capture.gif?raw=true)

## Usage

### Install

```sh
npm i visualne-selection-plugin --save
```

### Basic

```typescript
import { SelectionPlugin } from 'visualne-selection-plugin'
editor.use<Plugin, SelectionParams>(SelectionPlugin, { enabled: true })
```

### Advanced

```ts
export interface SelectionParams {
  /**
   * selection area's className for style
   */
  selectionArea?: {
    className?: string;
  };
  /**
   * selection mode's className for style
   */
  selectionMode?: {
    className?: string;
  };
  /**
   * enabled or disable selection
   * default false
   */
  enabled?: boolean;
  /**
   * mode text
   */
  mode?: [string, string];
}

import SelectionPlugin from 'visualne-selection-plugin'
editor.use(SelectionPlugin, {
  enabled: true,
  selectionMode: {
    className: 'text-weight-light custom-selection-pos'
  },
  mode: [
    'Single selection mode (press ctrl to enter [multiple selection mode])', 
    'Multiple selection mode (release ctrl to enter [single selection mode])'
  ]
})
```
