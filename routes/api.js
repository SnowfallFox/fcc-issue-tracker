'use strict';
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, { dbName:'Issues' });

const issueSchema = new mongoose.Schema({
  issue_title: { type:String },
  issue_text: { type:String },
  created_on: { type:Date, default:new Date },
  updated_on: { type:Date, default: new Date },
  created_by: { type:String },
  assigned_to: { type:String, default:"" },
  open: { type:Boolean, default:true },
  status_text: { type:String, default:"" }
});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      console.log(`performing GET with: ${project}`)
      let issue = mongoose.model(project, issueSchema);

      const tickets = await issue.find({}, {__v:0})
      res.json(tickets)

    })
    
    .post( async function (req, res){
      let project = req.params.project;
      let title = req.body.issue_title;
      let text = req.body.issue_text;
      let by = req.body.created_by;
      let to = req.body.assigned_to || ''; // optional
      let status = req.body.status_text || ''; // optional
      let issue = mongoose.model(project, issueSchema);
      
      console.log('POSTing')

      // if (title === '' || text === '' || by === '') {
        // should res.json({ error: 'required field(s) missing' }) 
        // but seems like you already can't even POST a request without the required fields? 
      // } else {
        // create ticket and save to DB
        const newIssue = new issue({ issue_title:title, issue_text:text, created_by:by, assigned_to:to, status_text:status });
        await newIssue.save();

        // grab ticket from DB and res.json
        const ticket = await issue.find({issue_title:title, issue_text:text, created_by:by, assigned_to:to, status_text:status}, {__v: 0});
        res.json(ticket[0])
      // }  
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
