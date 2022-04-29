// BUDGET CONTROLLER
var budgetController = (function () {
	var Expense = function (id, description, value) {
		(this.id = id), (this.description = description), (this.value = value), (this.percentage = -1)
	}
	var Income = function (id, description, value) {
		;(this.id = id), (this.description = description), (this.value = value)
	}
	Expense.prototype.calcPercentage = function(totalIncome){

		if(totalIncome > 0){
			this.percentage = Math.round((this.value /totalIncome) * 100)
		}
	else {
		this.percentage = -1
	}
	}
	Expense.prototype.getPercentage = function(){
		return this.percentage
	}
	var calculateTotal = function (type) {
		var sum = 0
		data.allItems[type].forEach(function (cur) {
			sum = sum + cur.value

			data.totals[type] = sum
		})
	}
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	}

	return {
		additem: function (type, des, val) {
			var newitem, ID

			// create new id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1 // last id + 1 for new items
			} else {
				ID = 0
			}

			// create new item based on exp or inc type
			if (type === 'exp') {
				newitem = new Expense(ID, des, val)
			} else if (type === 'inc') {
				newitem = new Income(ID, des, val)
			}

			// push it into our data structure
			data.allItems[type].push(newitem)

			// return the new element
			return newitem
		},
		deleteItem: function (type, id) {
			var ids, index

			ids = data.allItems[type].map(function (current) {
				return current.id
			})

			index = ids.indexOf(id)
			// id = 6
			// ids = [1, 2, 4, 6, 8] :: index would be 3
			// create an array with all ids and then find the index of the element with the id to be removed

			// loop over all elements in either 'inc' or 'exp' array
			// .map has access to current Element, current Index, and entire array in the callback
			// .map will RETURN a brand new array
			// create a new array
			if (index !== -1) {
				data.allItems[type].splice(index, 1)
			}
			console.log(index, ids)
		},

		calculateBudget: function () {
			// calculate totall income and budget
			// calculate the budget: income - budget
			// calculate the percentage of income that we spent

			calculateTotal('exp')
			calculateTotal('inc')
			data.budget = data.totals.inc - data.totals.exp
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
			} else {
				data.percentage = -1
			}
		},

		calculatePercentages: function(){
			data.allItems.exp.forEach(function(curr){
				curr.calcPercentage(data.totals.inc);
			})
		},
		getPercentages: function(){
			var allperc = data.allItems.exp.map(function(curr){
				return curr.getPercentage()
			})
			return allperc;
		},
		getBudget: function () {
			return {
				budget: data.budget,
				totalIncome: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},
		testing: function () {
			console.log(data)
		}
	}
})()

// UI CONTROLLER
var UIController = (function () {
	var DomStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel : '.item__percentage',
		DateLabel: '.budget__title--month'
	}
var	formatNumber =  function(num , type){
		var numSplit, int, dec, type
		// + or - before the number
		num = Math.abs(num)
		num = num.toFixed(2)
		// exactly 2 decimal points
		numSplit = num.split('.')
		int = numSplit[0]
		if(int.length > 3) {

			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3)
		}
		dec = numSplit[1]
		// comma separating the thousands

		

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec 
	}
	var nodeListforEach = function(list, callback){
		for(var i = 0; i < list.length;  i++ ) {
			callback(list[i], i);
		}}
	return {
		getInput: function () {
			return {
				type: document.querySelector(DomStrings.inputType).value,
				description: document.querySelector(DomStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DomStrings.inputValue).value)
			}
		},

		addListItem: function (obj, type) {
			var html, newhtml, element
			// create html string with placeholder text
			if (type === 'inc') {
				element = DomStrings.incomeContainer
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">x</i></button></div></div></div>'
			} else if (type === 'exp') {
				element = DomStrings.expensesContainer
				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">x</i></button></div></div></div>'
			}

			// replace placeholder text with some actual data
			newhtml = html.replace('%id%', obj.id)
			newhtml = newhtml.replace('%description%', obj.description)
			newhtml = newhtml.replace('%value%', formatNumber( obj.value, type));

			// Insert the html into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newhtml)
		},
		deleteListItem: function(selectorid){
			document.getElementById(selectorid).parentNode.removeChild(document.getElementById(selectorid))
		},
		clearFields: function () {
			var fields, fieldsArray

			fields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue) // list
			fieldsArray = Array.prototype.slice.call(fields) // list changed to array bcs of some functions arrey has
			fieldsArray.forEach(function (current, currentIndex, array) {
				current.value = ''
			})

			fieldsArray[0].focus()
		},

		displayBudget: function (obj) {
			var type
			obj.budget > 0 ? type='inc' : type = 'exp'
			document.querySelector(DomStrings.budgetLabel).textContent = formatNumber( obj.budget, type)
			document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc')
			document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')

			if (obj.percentage > 0) {
				document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%'
			} else {
				document.querySelector(DomStrings.percentageLabel).textContent = '---'
			}
		},
		displayPercentages: function(percentages){
			var fields = document.querySelectorAll(DomStrings.expensesPercLabel)

			

			
			nodeListforEach(fields, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}
				else {
					current.textContent = "---"
				}
			})
		},
		displayMonth: function(){
			var now, year
			now = new Date()
			year = now.getFullYear()

			document.querySelector(DomStrings.DateLabel).textContent = year

		},
		changedType: function(){
			var fields = document.querySelectorAll(
				DomStrings.inputType + ',' +
				DomStrings.inputDescription + "," +
				DomStrings.inputValue
			)
			nodeListforEach(fields, function(cur){
				cur.classList.toggle ('red-focus')
			})

			document.querySelector(DomStrings.inputBtn).classList.add('red')
		},
		
		getDomStrings: function () {
			return DomStrings
		}
	}
})()

// GLOBAL APP CONTROLLER
var controller = (function (BudgeCtrl, UICtrl) {
	var setupEventListers = function () {
		var Dom = UICtrl.getDomStrings()
		document.querySelector(Dom.inputBtn).addEventListener('click', controlAddButton)

		document.addEventListener('keypress', function (event) {
			if (event.keyCode === 13 || event.which === 13) {
				controlAddButton()
			}
		})

		document.querySelector(Dom.container).addEventListener('click', cntrlDeleteItem)
		document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changedType)
	}
	var updateBudget = function () {
		// 1. calculate the budget

		BudgeCtrl.calculateBudget()
		var budget = BudgeCtrl.getBudget()

		// 2. return the budget
		// 5. display the budget on the UI
		UICtrl.displayBudget(budget)
	}
	var updatePercentages = function(){
		//  1. calculate the budget
		BudgeCtrl.calculatePercentages()

		// 2. read percentages from the budget controller
		var percentages = BudgeCtrl.getPercentages()

		// 3. update user interface
		UICtrl.displayPercentages(percentages)
	}

	var controlAddButton = function () {
		var input, newitem
		// 1. get the field input data
		input = UICtrl.getInput()
		// 2. add the item to the budget controller

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			newitem = budgetController.additem(input.type, input.description, input.value)
			// 3. add the item to the UI
			UICtrl.addListItem(newitem, input.type)

			// 4. clear the description and value fileds
			UICtrl.clearFields()

			// 5. calculate and update budget
			updateBudget()

			// 6. calculate and update percentages
			updatePercentages()
		}
	}

	var cntrlDeleteItem = function (event) {
		var itemID, splitID, type, ID
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id
		if (itemID) {
			splitID = itemID.split('-')
			type = splitID[0]
			ID = parseInt(splitID[1])
			BudgeCtrl.deleteItem(type, ID)
			UICtrl.deleteListItem(itemID)
			updateBudget()
			// 6. calculate and update percentages
			updatePercentages()
		}
	}

	return {
		init: function () {
			console.log('application started')
			UICtrl.displayMonth()
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExp: 0,
				percentage: -1
			})
			setupEventListers()
		}
	}
})(budgetController, UIController)
controller.init()
