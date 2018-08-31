# scrollbar

自定义滚动条插件

## 注意事项
1. 当前插件不支持同时设置横向和纵向滚动条；
2. 支持ie8+、现代浏览器；（ie8滚动效果不如其他浏览器滚动效果平滑）
3. 为兼容ie8，添加了`bind`方法，有更好的实现可替换，或在不需要兼容ie8时，删除；

## 优点
* 只需引入js文件即可使用；
* 不依赖额外的css文件；
* 不依赖额外的js文件，如jquery等；
* 可以自己通过css样式，直接对当前未支持的样式自定义；
* 滚动条`class = "_scrollbar"`;
* 滚动滑块`class = "_scrollbar_inner"`;

## 插件调用方法
html中引用js即可；

### 默认对`document.body`创建纵向滚动条
```javascript
new Scrollbar()
```
### 指定滚动条方向
* 属性：`direction`
* Type: `string`
* 默认值：`y`
```javascript
// 当direction属性值为x|X时，为横向滚动条，其他值全部重置为纵向滚动条；
new Scrollbar({
  "direction": "x"
})
```

### 指定element创建滚动条
* 属性：`target`
* Type: `string|element`
* 默认值：`document.body`
```javascript
// target属性采用dom对象方式
new Scrollbar({
  "target": document.querySelector(".target")
})

// target属性采用选择器方式
new Scrollbar({
  "target": ".target"
})
```
### 设置滚动条是否仅鼠标悬浮时可见
* 属性：`visibleOnlyWhenHover`
* Type: `boolean`
* 默认值：`false`
```javascript
new Scrollbar({
  "visibleOnlyWhenHover": true
})
```

### 全部可配置属性

| 属性名               | type   | default | 可选值限制           | 描述                   |
| :------------------- | ------ | ------- | -------------------- | ---------------------- |
| direction | string | `"y"` | `x`\|`y`\|`X`\|`Y` | 指定滚动条朝向 |
| target | string\|element | `"body"` | `选择器`\|`dom对象` | 滚动条加载位置 |
| visibleOnlyWhenHover | boolean | `false` | `true`\|`false` | 滚动条仅鼠标悬浮可见 |
| position`纵向滚动条` | string | `"r"`   | `r`\|`l`\|`R`\|`L`   | 纵向滚动条位置         |
| position`横向滚动条` | string | `"b"`   | `b`\|`t`\|`B`\|`T`   | 横向滚动条位置         |
| mainAxisPercent      | string | `"90%"` | 百分数               | 滚动条主轴长度(占比) |
| crossAxisLength      | string | `"6px"` | 像素（需自带单位）   | 滚动条侧轴长度         |
| innerCrossAxisLength | string | `"6px"` | 像素（需自带单位）   | 滚动滑块的侧轴长度     |
| opacity              | int    | `.6`   | 0-1                  | 滚动条透明度           |
| outerColor           | string | `"#ffe7ba"` | 颜色                 | 滚动条底色             |
| innerColor           | string | `"#d46b08"` | 颜色                 | 滚动滑块颜色           |
| borderRadius         | string | `"5px"` | 同`border-radius` | 边框圆角               |

###### 注： 主轴为direction方向；侧轴与主轴方向垂直；
