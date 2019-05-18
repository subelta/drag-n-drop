"use strict"
/**
 * [DragScope]
 * @param  {[String]} draggableClass [класс перетаскиваемого элемента]
 * @param  {[String]} dropFieldClass [класс элемента, куда непосредственно можно положить перетаскиваемый элемент]
 * @param  {[String]} extDropFieldClass [класс элемента, при наведении на который возможен перенос в dropFieldClass
 *                                     (внутри него должен быть ОДИН dropFieldClass)]
 * @param  {[String]} highlightClass [класс со стилями для подсветки свободного для перетаскивания места]
 * @param  {[String]} dragStyleClass [класс со стилями для отображения переносимого елемента]
 * @return {[undefined]}
 */
var DragScope = function(draggableClass, dropFieldClass, extDropFieldClass, highlightClass, dragStyleClass) {

  var elemObject = {};
  var self = this;
  var highlighted = false;


  function onMouseDown(e) {
    if (e.button != 0) { 
        return; 
    } 

    var element = e.target.closest("." + draggableClass);
    if (!element) {
      return;
    }

    element.ondragstart = function() {
      return false;
    };

    elemObject.oldZindex = element.style.zIndex;
    elemObject.element = element;
    elemObject.initialX = e.pageX; //начальные коориднаты зажатия
    elemObject.initialY = e.pageY;
    return false;
  }

  function onMouseMove(e) {
    if (!elemObject.element) {
      return;
    }  // элемент не зажат

    if(!elemObject.dragging) {
      var moveX = e.pageX - elemObject.initialX;
      var moveY = e.pageY - elemObject.initialY;
      if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
        return;
      }
      elemObject.dragging = true;

      if (!elemObject.element) { // отмена переноса, нельзя "захватить" за эту часть элемента
        elemObject = {};
        return;
      }
      
      // shiftX/shiftY - разница между координатами левого верхнего угла и точкой зажатия
      var coords = getCoords(elemObject.element);
      elemObject.shiftX = elemObject.initialX - coords.left;
      elemObject.shiftY = elemObject.initialY - coords.top;
      startDrag(e); // начало переноса
    }
    elemObject.element.style.pointerEvents = 'none';
    elemObject.element.style.left = e.pageX - elemObject.shiftX + 'px'; //перенос объекта при каждом движении мыши
    elemObject.element.style.top = e.pageY - elemObject.shiftY + 'px';
    return false;
  }


  function onMouseUp(e) {
    if (elemObject.dragging) { // если перенос идет
      self.onDragEnd(e, elemObject);
    }
    elemObject = {};
  }


  function onMouseOver(e) {
    var el = elemObject.element;
    var target = e.target;  
  
    if (!el) {
      return;
    }
    if (target == highlighted) {
      return;
    } 


    if (target.classList.contains(extDropFieldClass)) {
      var dropZone = target.querySelector("." + dropFieldClass);
      dropZone.appendChild(highlighted);
    } else if (target.classList.contains(draggableClass)) {
      target.parentElement.insertBefore(highlighted, target);
    }
  }


  function startDrag(e) {
    var el = elemObject.element;
    setHighlighted();
    
    el.parentElement.insertBefore(highlighted, el);
    document.body.appendChild(el);
    elemObject.element.style.zIndex = 9999;
    el.style.position = 'fixed';
    el.classList.add(dragStyleClass);
  }

  
  this.onDragEnd = function(event, elemObject) {
    var el = elemObject.element;
    el.style.pointerEvents = 'auto';
    el.style.position = "static";
    el.classList.remove(dragStyleClass);
    elemObject.element.style.zIndex = elemObject.oldZindex;

    highlighted.replaceWith(el);
    highlighted = false;
  };


  function setHighlighted() {
    var el = elemObject.element;

    if (!highlighted) {
      highlighted = document.createElement(el.tagName);
      highlighted.classList.add(highlightClass);
      highlighted.classList.add(draggableClass);
      highlighted.style.height = el.offsetHeight;
      highlighted.style.width = el.offsetWidth;
    }
  }

  //не addEventListener чтобы не слушались посторонние события, в данном случае выделение текста
  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp; 
  document.onmousedown = onMouseDown;
  document.onmouseover = onMouseOver;

  //Задается при подключении на страницу
};


function getCoords(element) { // кроме IE8-
  var box = element.getBoundingClientRect();

  return {
    // top: box.top + pageYOffset,
    // left: box.left + pageXOffset
    top: box.top ,
    left: box.left
  };
}


function insertAfter(elem, refElem) {
  return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}
