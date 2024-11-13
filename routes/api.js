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
      let id = req.query._id;
      let title = req.query.issue_title;
      let text = req.query.issue_text;
      let c_date = req.query.created_on;
      let u_date = req.query.updated_on;
      let by = req.query.created_by;
      let to = req.query.assigned_to;
      let open = req.query.open;
      let issue = mongoose.model(project, issueSchema);

      // get all tickets
      let tickets = await issue.find({}, {__v:0});

      // filter based on entered queries, if any
      if (id) {
        tickets = tickets.filter(t => t._id == id)
      }
      if (title) {
        tickets = tickets.filter(t => t.issue_title == title)
      }
      if (text) {
        tickets = tickets.filter(t => t.issue_text == text)
      }
      if (c_date) {
        tickets = tickets.filter(t => t.created_on == c_date)
      }
      if (u_date) {
        tickets = tickets.filter(t => t.updated_on == u_date)
      }
      if (by) {
        tickets = tickets.filter(t => t.created_by == by)
      }
      if (to) {
        tickets = tickets.filter(t => t.assigned_to == to)
      }
      if (open) {
        if (open == 'true') {
          tickets = tickets.filter(t => t.open == true)
        } else if (open == 'false') {
          tickets = tickets.filter(t => t.open == false)
        } else {
          res.json({ 'error': 'open must be true or false' })
        }
      }

      res.json(tickets);

    })
    
    .post( async function (req, res){
      let project = req.params.project;
      let title = req.body.issue_title;
      let text = req.body.issue_text;
      let by = req.body.created_by;
      let to = req.body.assigned_to || ''; // optional
      let status = req.body.status_text || ''; // optional
      let issue = mongoose.model(project, issueSchema);

      // if any required fields left empty, return error
      if (!title || !text || !by) {
        res.json({ error: 'required field(s) missing' }) 
      } else {
        // create ticket and save to DB
        const newIssue = new issue({ issue_title:title, issue_text:text, created_by:by, assigned_to:to, status_text:status });
        await newIssue.save();

        // grab ticket from DB and res.json
        const ticket = await issue.find({issue_title:title, issue_text:text, created_by:by, assigned_to:to, status_text:status}, {__v: 0});
        res.json(ticket[0])
      }  
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      let id = req.body._id;
      let title = req.body.issue_title;
      let text = req.body.issue_text;
      let by = req.body.created_by;
      let to = req.body.assigned_to;
      let status = req.body.status_text;
      let open = req.body.open;
      let updates = {};
      let issue = mongoose.model(project, issueSchema);

      // if no id entered, return error
      if (!id) {
        res.json({ 'error': 'missing _id'})
      // if no optional fields selected or entered, return error
      } else if (!title && !text && !by && !to && !status && !open) {
        res.json({ error: 'no update field(s) sent', '_id': id })
      // if optional fields entered, store in an object containing only filled fields and update time
      } else {
          if (title) {
            updates.issue_title = title;
          }
          if (text) {
            updates.issue_text = text;
          }
          if (by) {
            updates.created_by = by;
          }
          if (to) {
            updates.assigned_to = to;
          } if (status) {
            updates.status_text = status;
          }
          if (open) {
            updates.open = false;
          }
          updates.updated_on = new Date
        // try finding entry with matching ID
        try {
          let query = await issue.findById(id)
          // if entry found, update with updates obj and res with success message
          if (query) {
            await issue.updateOne(query, updates)
            res.json({ result:'successfully updated', '_id':id })
          // if entry not found, return error
          } else {
            res.json({ error: 'could not update', '_id': id })
          }
        // if err, return error
        } catch (err) {
          console.log(err)
          res.json({ error: 'could not update', '_id': id })
        }
      }
    })
    // You can send a DELETE request to /api/issues/{projectname} with an _id to delete an issue.
    // On failure, the return value is { error: 'could not delete', '_id': _id }.
    .delete(async function (req, res){
      let project = req.params.project;
      let id = req.body._id;
      let issue = mongoose.model(project, issueSchema);

      // If no _id is sent, return error
      if (!id) {
        // console.log('no ID')
        res.json({ error: 'missing _id' })
      } else {
        try {
          // check DB for entry with entered ID
          let query = await issue.findById(id)
          // if found, find again and delete, respond with result
          if (query) {
            await issue.findByIdAndDelete(id)
            res.json({ result: 'successfully deleted', _id: id })
          // if not found, return error
          } else {
            res.json({ error: 'could not delete', _id: id })
          }
        // if error in try attempt, return error
        } catch (err) {
          console.log(err)
          res.json({ error: 'could not delete', _id: id })
        }
      }
    });
};
