const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('POST tests', function() {
        test('Successfully POST with every field filled', function(done) {
            chai
                .request(server)
                .keepOpen()
                .post('/api/issues/chai_tests')
                .send({ issue_title:'test_all_fields', issue_text:'text1', created_by:'willow', assigned_to:'snow', status_text:'status1' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.issue_title, 'test_all_fields');
                    assert.equal(res.body.issue_text, 'text1');
                    assert.equal(res.body.created_by, 'willow');
                    assert.equal(res.body.assigned_to, 'snow');
                    assert.equal(res.body.status_text, 'status1');
                    assert.equal(res.body.open, true);
                    assert.typeOf(res.body._id, 'string');
                    done();
                });
        })
         test('successfully POST with only required fields filled', function(done) {
            chai
                .request(server)
                .keepOpen()
                .post('/api/issues/chai_tests')
                .send({ issue_title:'test_required_fields', issue_text:'text2', created_by:'willow' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.issue_title, 'test_required_fields')
                    assert.equal(res.body.issue_text, 'text2');
                    assert.equal(res.body.created_by, 'willow');
                    assert.equal(res.body.assigned_to, '');
                    assert.equal(res.body.status_text, '');
                    assert.equal(res.body.open, true);
                    assert.typeOf(res.body._id, 'string');
                    done();
                });
         })
         test('POST attempt fails when required fields are empty', function(done) {
            chai
                .request(server)
                .keepOpen()
                .post('/api/issues/chai_tests')
                .send({ status_text:'test_missing_requirements' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.error, 'required field(s) missing');
                    done();
                });
         });
    })
    suite('GET tests', function() {
        test('successfully GET all issues for a project', function(done) {
            chai
                .request(server)
                .keepOpen()
                .get('/api/issues/chai_tests')
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isObject(res.body[0]);
                    done();
                });
        })
        test('successfully GET issues for a project, matching one filter', function(done) {
            chai
                .request(server)
                .keepOpen()
                .get('/api/issues/chai_tests?issue_text=text1')
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isObject(res.body[0]);
                    res.body.forEach(x => assert.equal(x.issue_text, 'text1'));
                    done();
                });
        })
        test('successfully GET issues for a project, matching multiple filters', function(done) {
            chai
                .request(server)
                .keepOpen()
                .get('/api/issues/chai_tests?issue_text=text1&assigned_to=snow')
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isObject(res.body[0]);
                    res.body.forEach(x => assert.equal(x.issue_text, 'text1'));
                    res.body.forEach(y => assert.equal(y.assigned_to, 'snow'));
                    done();
                });
        });
    })
    suite('PUT tests', function() {
        test('update a single field on an existing issue', function(done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/chai_tests')
                .send({ _id: '6734b0045bf45201bfb85fd1', status_text:'status changed by PUT test' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, '6734b0045bf45201bfb85fd1');
                    done();
                });
        })
        test('update multiple fields on an existing issue', function(done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/chai_tests')
                .send({ _id: '6734b0045bf45201bfb85fd1', status_text:'status changed again by PUT test', open:'false' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, '6734b0045bf45201bfb85fd1');
                    done();
                });
        })
        test('PUT fails when no ID is provided', function(done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/chai_tests')
                .send({ status_text:'test status!!', open:'false' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        })
        test('PUT fails when no optional changes are entered/applied to ticket', function(done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/chai_tests')
                .send({ _id: '6734b0045bf45201bfb85fd1' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.error, 'no update field(s) sent');
                    assert.equal(res.body._id, '6734b0045bf45201bfb85fd1');
                    done();
                });
        })
        test('PUT fails when an invalid ID is entered', function(done) {
            chai
                .request(server)
                .keepOpen()
                .put('/api/issues/chai_tests')
                .send({ _id: '6734b0045bf45201bfb85fd7', status_text:'should fail' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.error, 'could not update');
                    assert.equal(res.body._id, '6734b0045bf45201bfb85fd7');
                    done();
                });
        });
    })
    suite('DELETE tests', function() {
        test('successfully delete an issue', function(done) {
            chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/chai_tests')
                .send({ _id: '6734b0a4e24af7e7255bcb10' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.result, 'successfully deleted');
                    assert.equal(res.body._id, '6734b0a4e24af7e7255bcb10');
                    done();
                });
        })
        test('DELETE fails with invalid id', function(done) {
            chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/chai_tests')
                .send({ _id: '6734b5381c770e56af200765' })
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.error, 'could not delete');
                    assert.equal(res.body._id, '6734b5381c770e56af200765');
                    done();
                });
        })
        test('DELETE fails with missing id', function(done) {
            chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/chai_tests')
                .end(function (err,res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        })
    })
    
    // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
    // Delete an issue with missing _id: DELETE request to /api/issues/{project}

});
