/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var draw_translations = {'zh': {
        'Cancel drawing': '取消当前的画图形操作.',
        "Cancel": "取消.",
        "Delete last point drawn": "删除最后所画的点.",
        "Delete last point": "删除最后一个点.",
        "Draw a polyline": "画线.",
        "Draw a polygon": "画多边形.",
        "Draw a rectangle": "画矩形.",
        "Draw a circle": "画圆.",
        "Draw a marker": "画标记.",
        "Click and drag to draw circle.": "单击并拖动以画圆.",
        "Click map to place marker.": "点击地图以放置标记.",
        "Click to start drawing shape.": "点击开始画图形.",
        "Click to continue drawing shape.": "点击继续画图形.",
        "Click first point to close this shape.": "点击第一个点来关闭这个图形.",
        "<strong>Error:</strong> shape edges cannot cross!": "<strong>错误:</strong> 图形边界不能交叉!",
        "Click to start drawing line.": "点击开始画线.",
        "Click to continue drawing line.": "点击继续画线.",
        "Click last point to finish line.": "单击最后一个点来结束画线.",
        "Click and drag to draw rectangle.": "单击并拖动鼠标画矩形.",
        "Release mouse to finish drawing.": "松开鼠标完成当前的操作.",
        "Save changes": "保存更改.",
        "Save": "保存.",
        "Cancel editing, discards all changes": "取消编辑，放弃所有更改.",
        "Edit layers": "编辑图层.",
        "No layers to edit": "没有图层进行编辑.",
        "Delete layers": "删除图层.",
        "No layers to delete": "没有图层删除.",
        "Drag handles, or marker to edit feature.": "拖动控制点，或标记编辑功能.",
        "Click cancel to undo changes.": "单击‘取消’取消修改.",
        "Click on a feature to remove": "点击要删除的图元进行删除操作."
    }
};
if (I18n !== undefined && I18n.translations !== undefined)
{
    I18n.translations=$.merge(I18n.translations,draw_translations);
}
else if (I18n !== undefined) {
    I18n.translations = draw_translations;
}
else {
    var I18n;
    I18n = I18n || {};
    I18n.translations = draw_translations;
}

