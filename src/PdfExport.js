/**
 * Created by maojunfeng on 17/9/04.
 */
import JSPDF from 'jspdf';
import html2canvas from 'transformcanvas';
export default class {
    constructor (element = document.body, fileName = 'hello', direction = '', flag) {
        // pdf info
        this.A4Width = 595.28;
        this.A4Height = 841.89;
        this.flag = flag;
        this.element = element;
        this.fileName = fileName;
        this.direction = direction;
        if (this.direction === 'landscape') {
            this.A4Width = 841.89;
            this.A4Height = 595.28;
        }
        this.pdf = new JSPDF(this.direction, 'pt', 'a4');
    }
    _getPixelRatio (context) {
        var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    }
    _drawDom () {
        var width = this.element.offsetWidth;  // 获取(原生）dom 宽度
        var height = this.element.offsetHeight; // 获取(原生）dom 高
        var offsetTop = this.element.offsetTop;  //元素距离顶部的偏移量
        var canvas = document.createElement('canvas');  //创建canvas 对象
        var context = canvas.getContext('2d');
        // var scale = 14 / (window.devicePixelRatio || 1);  //获取像素密度的方法 (也可以采用自定义缩放比例)
        var scale = 4;  //获取像素密度的方法 (也可以采用自定义缩放比例)
        canvas.width = width * scale;   //这里 由于绘制的dom 为固定宽度，居中，所以没有偏移
        canvas.height = (height + offsetTop) * scale;  // 注意高度问题，由于顶部有个距离所以要加上顶部的距离，解决图像高度偏移问题
        context.scale(scale, scale);
        return {
            allowTaint: true, //允许加载跨域的图片
            tainttest: true, //检测每张图片都已经加载完成
            scale, // 添加的scale 参数
            canvas, //自定义 canvas
            logging: false, //日志开关，发布的时候记得改成false
            width, //dom 原始宽度
            height //dom 原始高度
        };
    }
    _ajustDom (pageHeight, elements, k = 0, count = 1) {
        for (let key = k; key < elements.length; key++) {
            let ele = elements[key];
            let leftHeight = pageHeight - (ele.offsetTop + ele.offsetHeight);
            if (leftHeight < 0) {
                count++;
                let proEle = elements[key - 1];
                let proLeftHeight = pageHeight - (proEle.offsetTop + proEle.offsetHeight);
                proEle.style.marginBottom = +(proEle.style.marginBottom.replace('px', '')) + 20 + proLeftHeight + 'px';
                this._ajustDom(pageHeight * count, elements, key, count);
                break;
            }
        }
    }
    _createPdf (calback) {
        const opts = this._drawDom();
        html2canvas(this.element, opts).then(canvas => {
            let contentWidth = canvas.width;
            let contentHeight = canvas.height;
            //一页pdf显示html页面生成的canvas高度;
            let pageHeight = (contentWidth / this.A4Width) * this.A4Height;
            //未生成pdf的html页面高度
            let leftHeight = contentHeight;
            //页面偏移
            let position = 0;
            //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
            let imgWidth = this.A4Width;
            let imgHeight = this.A4Width / contentWidth * contentHeight;
            let pageData = canvas.toDataURL('image/jpeg', 1.0);
            //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
            //当内容未超过pdf一页显示的范围，无需分页
            if (leftHeight < pageHeight) {
                this.pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
            } else {
                while (leftHeight > 0) {
                    this.pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
                    leftHeight -= pageHeight;
                    position -= this.A4Height;
                    //避免添加空白页
                    if (leftHeight > 0) {
                        this.pdf.addPage();
                    }
                }
            }
            calback && calback();
            this.pdf.save(`${this.fileName}.pdf`);
        })
    }
    exportPdf (calback) {
        html2canvas(this.element).then(canvas => {
            let contentWidth = canvas.width;
            // 一页pdf显示html页面生成的canvas高度;
            let pageHeight = (contentWidth / this.A4Width) * this.A4Height;
            this._ajustDom(pageHeight, this.element.querySelectorAll(this.flag));
            this._createPdf(calback);
        })
    }
}
