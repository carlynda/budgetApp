const btn_add = document.querySelector('.add__btn'); 
const inp_description = document.querySelector('.add__description'); 
const inp_type = document.querySelector('.add__type'); 
const inp_value = document.querySelector('.add__value'); 
const inc_container = document.querySelector('.income__list'); 
const exp_container = document.querySelector('.expenses__list')
const inp_fields = document.querySelectorAll('.add__description, .add__value' ); 
const lbl_budget = document.querySelector('.budget__value');
const lbl_income = document.querySelector('.budget__income--value');
const lbl_expenses = document.querySelector('.budget__expenses--value'); 
const lbl_percentage = document.querySelector('.budget__expenses--percentage');
const container = document.querySelector('.container');
const monthDisplay = document.querySelector('.budget__title--month');
const fields = document.querySelectorAll('.add__type, .add__value, .add__description');




//this is the Data module 
var budgetController = (function() {

    var Expense = function(id, des, val){
        this.id = id;
        this.des = des;
        this.val = val; 
        this.percentage = -1; 
    };

    var Income = function(id, des, val){
        this.id = id;
        this.des = des;
        this.val = val;
    };


    //Separate of concerns: this calculates percentage
    Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.val / totalIncome) * 100); 
        }else{
            this.percentage = -1; 
        }
    };
    //this returns the % 
    Expense.prototype.getPercentage = function(){
        return this.percentage; 
    }; 

    var data = {
        allItems:{
            exp: [],
            inc: [],
        }, 
        totals:{
            exp: 0,
            inc: 0, 
        },
        budget: 0, 
        percentage : -1, //when something is not exist
    }; 

    var calculateTotal = function(type){
        var sum = 0; 
        data.allItems[type].forEach(function(cur){
            sum += cur.val; 
        });
        data.totals[type] = sum; 
    };

    return{
        addItem: function(type, des, val){
            //adding new item:
            var newItem, ID; 
            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //create new item according to 'inc' or 'exp' 
            if(type === 'inc'){newItem = new Income(ID, des, val) 
            }else if (type === 'exp') {newItem = new Expense(ID, des, val)}
            
            //push new item into the data structure for corresponding type: inc or exp 
            data.allItems[type].push(newItem); 
            // console.log(data.allItems[type]);

            //return the new item 
            return newItem; 
        }, 

        deleteItem: function(type, id){
            var ids, index; 
            //if id = 6, create another array and find out the index of id 6 
            //[1,2,3,5,6,7] => index = 4 
            //map returns a brand new array 
            // console.log(data.allItems[type]);
            ids = data.allItems[type].map(function(current){
                return current.id; 
            }); 
            index = ids.indexOf(id);

            if (index !== -1){
                //delete --use splice(position, number of element) 
                data.allItems[type].splice(index, 1);
            }

        }, 


        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc'); 
            //calculate budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp; 
            //cal the % 
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }   
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach( el => {
                el.calculatePercentage(data.totals.inc);
            });
        }, 

        getPercentages : function(){
            var allPercentages; 
            allPercentages = data.allItems.exp.map(el => {
                return el.getPercentage(); 
            }); 
            return allPercentages; 
        }, 

        getBudget : function(){
            return{
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage,
            }
        }, 

        testing: function(){
            console.log(data);
        }
    }
})();  


//this is the UI module 
var UIController = (function(){

    var formatNumber =  function(num,type){
        var numSplit, int, dec, type; 
        //+ - before the number 
        //exactly 2 dec points
        //comma separating the thousands

        num = Math.abs(num);
        num = num.toFixed(2); //returns a string

        numSplit = num.split('.'); 
        int = numSplit[0]; 
        dec = numSplit[1]; 

        if(int.length > 3){
            int = int.substr(0 , int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }
        return (type === 'exp' ? '- ': '+ ') + int + '.' +  dec; 

    };
    var nodeListForEach = function(list, callback){
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i); 
        }
    };


    
    return{
        //to get user input: 
        //put in iife because we want encapsulation. 
        getInput: function(){ 
            return{    
            type : inp_type.value, //inc or exp 
            description : inp_description.value,
            value : parseFloat(inp_value.value), }
        }, 

        addListItems: function(obj, type){
           var html, newHtml, element; 
            //create HTML string with placeholder text 
            if(type === 'inc'){
                element = inc_container; 
                html = `<div class="item clearfix" id="inc-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }else if (type === 'exp'){
                element = exp_container; 
                html = `<div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }; 
            //replace the placeholder with data from the object
            newHtml = html.replace('%id%', obj.id); 
            newHtml = newHtml.replace('%description%', obj.des); 
            newHtml = newHtml.replace('%value%', formatNumber(obj.val, type)); 
            // console.log(newHtml);


            //insert the HTML into the DOM (return the complete HTML)
            element.insertAdjacentHTML('beforeend', newHtml); 
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID); 
            el.parentNode.removeChild(el); 
        }, 

        clearFields : function(){
            var fieldArr = Array.prototype.slice.call(inp_fields); 

            fieldArr.forEach(element => {
                element.value = '';                 
            });
            fieldArr[0].focus(); 
        }, 

        displayBudget : function(obj){
            var type; 
            type = obj.budget > 0 ? 'inc' : 'exp';

            lbl_budget.textContent = formatNumber(obj.budget, type); 
            lbl_expenses.textContent = formatNumber(obj.totalExp, 'exp'); 
            lbl_income.textContent = formatNumber(obj.totalInc, 'inc'); 
            
            if(obj.percentage > 0){
                lbl_percentage.textContent = obj.percentage + '%'; 
            }else{
                lbl_percentage.textContent =  '----'; 
            }
        }, 

        displayPercentages: function(percentages){
            const item_percentage = document.querySelectorAll('.item__percentage');

            nodeListForEach(item_percentage, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        displayMonth : function(){
            var now, year, month, months; 

            now = new Date(); 
            year = now.getFullYear();
            months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ]
            month = now.getMonth();  
            monthDisplay.textContent = months[month] + ', ' + year; 
        },

        changeType : function(){
            nodeListForEach(fields, (current) => {
                current.classList.toggle('red-focus'); 
            });
            btn_add.classList.toggle('red');
        },
        
    
        
    }
})();

//this module is used to connect the 2 modules - controller module 
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        btn_add.addEventListener('click', ctrlAddItem); 
        //To listen to the keypress when user hit Enter instead of clicking the button 
        //keypress event is popular, but it's ANY key => use Key code to pick Enter key only 
        //using which for older browser 
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem(); 
            }
        });
        container.addEventListener('click', ctrlDeleteItem);

        inp_type.addEventListener('change', UICtrl.changeType); 


    }

    var updateBudget = function(){
        //4. Calculate budget 
        budgetCtrl.calculateBudget(); 

        //4.5 Return the budget
        var budget = budgetCtrl.getBudget();  

        //5. Display the budget on UI 
        UICtrl.displayBudget(budget); 
    };

    var updatePercentages = function(){
        //calculate the %
        budgetCtrl.calculatePercentages(); 

        //read percentages from budget controller 
        var percentages = budgetCtrl.getPercentages(); 

        //update UI with new % 
        // console.log(percentages);
        UICtrl.displayPercentages(percentages); 
    }; 

    var ctrlAddItem = function(){
        var input, newItem;
        //TODO LIST: 
        //1. Get input data from <input>
        input = UICtrl.getInput();

        if(input.description !== '' && ! isNaN(input.value) && input.value > 0 ){
            //2. Add item to budget cotroller 
            newItem = budgetController.addItem(input.type, input.description, input.value); 
            // console.log(newItem);
    
            //3. Add the item to UI
           UICtrl.addListItems(newItem, input.type);
           //clear the input field after user enters 
           UICtrl.clearFields();
    
           //Calculate and update budget: 
           updateBudget(); 

           //calculate and update % 
           updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID; 
        //DOM traversing
        
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if(itemID){
            //inc-
            splitID = itemID.split('-'); 
            type = splitID[0];
            ID = parseInt(splitID[1]); 

            //delete the item from the data structure
            budgetCtrl.deleteItem(type, ID); 

            //delete the item from the UI 
            UICtrl.deleteListItem(itemID); 

            //update and show the new budget 
            updateBudget(); 

            //update the % 
            updatePercentages(); 
        }
    }

    return{
        init: function() { 
            console.log('app has started');
            setupEventListeners(); 
            UICtrl.displayMonth(); 
            UICtrl.displayBudget({
                budget: 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1,
            }); 
        }
    };
})(budgetController, UIController); 

controller.init(); 