---
id: tip
title: Tip
---

import { TipComponent } from "./tip.js"

<p>See tip by hovering over buttons.</p>

## Placement

<p>Change tip placement by <code>placement</code> prop.</p>

### Auto placement

<TipComponent type="auto" place={['auto-start', 'auto', 'auto-end']}></TipComponent>

### Top placement

<TipComponent type="top" place={['top-start', 'top', 'top-end']}></TipComponent>

### Right placement

<TipComponent type="right" place={['right-start', 'right', 'right-end']}></TipComponent>

### Bottom placement

<TipComponent type="bottom" place={['bottom-end', 'bottom', 'bottom-start']}></TipComponent>

### Left placement

<TipComponent type="left" place={['left-end', 'left', 'left-start']}></TipComponent>

## API

<TipComponent type="APItip" table={[
  ['text', 'string', '', 'Defines the tip text'],
  ['placement', 'auto (auto | auto-start | auto-end) | top (top | top-start | top-end) | right (right | right-start | right-end) | bottom (bottom | bottom-start | bottom-end) | left (left | left-start | left-end)', 'auto', 'Set the placement of tip']
  ]}></TipComponent>