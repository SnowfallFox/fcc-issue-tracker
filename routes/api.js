'use strict';
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, { dbName:'Issues' });

const issueSchema = new mongoose.Schema({
  issue_title: { type:String, required:true },
  issue_text: { type:String, required:true },
  created_on: { type:Date, default:new Date },
  updated_on: { type:Date, default: new Date },
  created_by: { type:String, required:true },
  assigned_to: { type:String, default:"" },
  open: { type:Boolean, default:true },
  status_text: { type:String, default:"" }
}, { collection: 'apitest' });

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;

    })
    
    .post(function (req, res){
      let project = req.params.project;
      let title = req.body.issue_title;
      let text = req.body.issue_text;
      let by = req.body.created_by;
      let to = req.body.assigned_to; // optional
      let status = req.body.status_text; // optional
      let issue = mongoose.model('apitest', issueSchema);

      const newIssue = new issue({ issue_title:title, issue_text:text, created_by:by });
      newIssue.save();
      
      // post should save valid tickets to the DB
      // otherwise return { error: 'required field(s) missing' }

      // console.log(new Date)
      // return { title:title, text:text, by:by, to:to, status:status, created_on:date, updated_on:date }    
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
