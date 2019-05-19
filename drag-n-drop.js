"use strict"
/**
 * [DragScope]
 * @param  {[String]} draggableClass [HTML класс перетаскиваемого элемента]
 * @param  {[String]} dropFieldClass [HTML класс элемента, куда непосредственно можно положить перетаскиваемый элемент]
 * @param  {[String]} extDropFieldClass [HTML класс элемента, при наведении на который возможен перенос в dropFieldClass
 *                                     (внутри него должен быть ОДИН dropFieldClass)]
 * @param  {[String]} highlightClass [HTML класс со стилями для подсветки свободного для перетаскивания места]
 * @param  {[String]} dragStyleClass [HTML класс со стилями для отображения переносимого елемента]
 * @return {[undefined]}
 */
var DragScope = function(draggableClass, dropFieldClass, extDropFieldClass, highlightClass, dragStyleClass) {
  var elemObject = {};
  var dropPlace = false;
  // if (extDropFieldClass == dropFieldClass) {
  //   extDropFieldClass = dropFieldClass;
  // }


  function onMouseDown(e) {
    var element = e.target.closest("." + draggableClass);

    if ((e.button != 0) || (!element)){ 
        return; 
    } 

    elemObject.oldZindex = element.style.zIndex;
    elemObject.el = element;
    //начальные коориднаты зажатия
    elemObject.initX = e.pageX; 
    elemObject.initY = e.pageY;
    return false;
  }



  function onMouseMove(e) {
    // элемент не зажат
    if (!elemObject.el) {
      return;
    }  

    if(!elemObject.isDragged) {
      var moveX = e.pageX - elemObject.initX;
      var moveY = e.pageY - elemObject.initY;
      if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
        return;
      }
      elemObject.isDragged = true;
      
      // shiftX/shiftY - разница между координатами левого верхнего угла и точкой зажатия
      var coords = getCoords(elemObject.el);
      elemObject.shiftX = elemObject.initX - coords.left;
      elemObject.shiftY = elemObject.initY - coords.top;
      //сохраняем изначальные (вычисленные) размеры элемента в тч padding и border-width (для dropPlace)
      elemObject = saveSizes(elemObject); 

      //подсветка места дропа
      dropPlace = setDropPlace(elemObject,draggableClass, highlightClass);
      elemObject.el.parentElement.insertBefore(dropPlace, elemObject.el);
      elemObject.el = startDrag(elemObject, dragStyleClass);
    }

    elemObject.el.style.pointerEvents = 'none';
    //перенос объекта при каждом движении мыши
    elemObject.el.style.left = e.pageX - elemObject.shiftX + 'px'; 
    elemObject.el.style.top = e.pageY - elemObject.shiftY + 'px';
    return false;
  }



  function onMouseUp() {
    if (elemObject.isDragged) {
      dropElement(elemObject, dropPlace, dragStyleClass);
      dropPlace = false;
    }
    elemObject = {};
    return false;
  }



  function onMouseOver(e) {
    var el = elemObject.el;
    var target = e.target;  
  
    if ((!el) || (target == dropPlace)) {
      return;
    }

    var sibling = target.classList.contains(draggableClass);
    var extField = target.closest('.' + extDropFieldClass)
                   
    if (sibling) {
      target.parentElement.insertBefore(dropPlace, target);
    } else if (extField) {
      var dropZone = extField.querySelector("." + dropFieldClass) ||
                     extField;
      dropZone.appendChild(dropPlace);
    }
    return false;
  }


  //не addEventListener чтобы не слушались посторонние события, в данном случае выделение текста
  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp; 
  document.onmousedown = onMouseDown;
  document.onmouseover = onMouseOver;
};




function saveSizes(elemObject) {
  var el = elemObject.el;
  var elStyle = window.getComputedStyle(el);

  elemObject.width = elStyle.getPropertyValue('width');
  elemObject.height = elStyle.getPropertyValue('height');
  elemObject.padding = elStyle.getPropertyValue('padding');
  elemObject.borderWidth = elStyle.getPropertyValue('border-width');
  
  return elemObject;
}



function startDrag(elemObject, dragStyleClass) {
  var el = elemObject.el;
  
  el.style.height = elemObject.height;
  el.style.width = elemObject.width;
  el.style.zIndex = 9999;
  el.style.position = 'fixed';
  if (dragStyleClass) {
    el.classList.add(dragStyleClass);
  }

  document.body.appendChild(el);
  return el;
}



function dropElement(elemObject, dropPlace, dragStyleClass) {
  var el = elemObject.el;

  el.style.pointerEvents = 'auto';
  el.style.position = "static";
  el.style.height = '';
  el.style.width = '';
  if (dragStyleClass) {
    el.classList.remove(dragStyleClass);
  }
  elemObject.el.style.zIndex = elemObject.oldZindex;

  dropPlace.replaceWith(el);
}



function setDropPlace(elemObject, draggableClass, highlightClass) {
  var el = elemObject.el;
  var dropPlace; 
  
  if (!dropPlace) {
    dropPlace = document.createElement(el.tagName);
    dropPlace.classList.add(highlightClass, draggableClass);
    dropPlace.style.height = elemObject.height;
    dropPlace.style.width = elemObject.width;
    dropPlace.style.padding = elemObject.padding;
    dropPlace.style.borderWidth = elemObject.borderWidth;
  }
  return dropPlace;
}



function getCoords(element) {
  var box = element.getBoundingClientRect();
  return {
    top: box.top ,
    left: box.left
  };
}



function insertAfter(elem, refElem) {
  return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}
