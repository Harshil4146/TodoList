//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const req = require("express/lib/request");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:Admin123@cluster0.fefhy.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit + buttton to add new item"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();
 Item.find({}, function(err, fetchItems){
   if(fetchItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Insert successfully");
      }
    });
    res.redirect("/")
   }else {
    res.render("list", {listTitle: "Today", newListItems: fetchItems});
   }
 });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listTitle === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listTitle}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listTitle)
    });
  }

  

});

app.post("/delete", function(req, res){
  const listName = req.body.listName;
  if(listName === "Today"){

  Item.deleteOne({_id:req.body.checkbox}, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Delete Successfully");
    }
  });
  res.redirect("/");
  }else{
    List.findOneAndRemove({name : listName}, {$pull: {items: {_id: req.body.checkbox}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListname", function(req, res){
  const customListname = _.capitalize(req.params.customListname);
  List.findOne({name: customListname}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListname,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customListname);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
