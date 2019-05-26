# drag-n-drop
Simple importable Drag'n'Drop implementation (vanilla JS) 

### На вход принимается:
+ (обязательно) dragClass [HTML класс перетаскиваемого элемента]
+ (обязательно) dropFieldClass [HTML класс элемента, куда может быть добавлен перетаскиваемый элемент]
+ (обязательно) extDropFieldClass [HTML класс элемента, при наведении на который подсвечивается место в dropFieldClass и возможен перенос]
+ (необязательно) highlightClass [HTML класс со стилями для подсветки свободного для перетаскивания места]
+ (необязательно) dragStyleClass [HTML класс со стилями для отображения переносимого елемента]

Можно указать один и тот же класс в dropFieldClass и extDropFieldClass

Если внутри элемента с extDropFieldClass нет элемента с dropFieldClass и они не равны, перенос не будет возможен
