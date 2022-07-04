//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const url="mongodb+srv://admin:Raj2001@cluster0.bukls.mongodb.net/todolistDB";

const lodash=require("lodash");


mongoose.connect(url);
const app = express();

const itemSchema= {
  name:String
}
const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
name:"Welcome ToDoList"
});
const item2=new Item({
  name:"Hit the + to add element"
  });
const item3=new Item({
    name:"<---- hit to delete the item"
    });
   
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);








app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var items=[]
app.get("/", function(req, res) {
  const day = date.getDate();
Item.find({},function(err,results){

  if(err){
    console.log(err);
  }else{
    if(results.length===0){
      Item.insertMany(defaultItems,function(err){console.log(err);});
      res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: results});
  }
}
});



  

});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listName=req.body.list;
  
  const newitem= new Item({
    name:req.body.newItem
  });
if(listName==="Today"){
  newitem.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    if(err){
      console.log(err);
    }else{
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/"+listName);
    }
  });
}



 
});
app.post("/delete",function(req, res){
const id=req.body.checkbox;
const listName=req.body.listName;
if(listName==="Today"){
Item.deleteOne({_id:id},function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Success");
  }
  res.redirect("/");
});
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundlist){
    if(!err){
      res.redirect("/"+listName);
    }
  });


}

});

app.get("/:customListName",function(req,res){
  const customListName=lodash.capitalize(req.params.customListName);



List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list",{listTitle: customListName, newListItems: foundList.items});
    }
    }
});


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
