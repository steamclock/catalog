/*
 * Test for Grad Catalog
 * run 'mocha -R nyan' from project root for maximum test delightfulness
 *
 */


var chai = require('chai')
  ,  expect = chai.expect
  , chaiHttp = require('chai-http')
  , baseURL = 'http://localhost:3000';

chai.use(chaiHttp);


describe('Grad Catalog Tests', function() {
    describe('Home page URL', function() {
        it('should return 200 OK', function() {
            chai.request(baseURL)
            .get('/')
            .res(function (res) {
                expect(res).to.have.status(200);
            });
        });
    });    

    describe('About page URL', function() {
        it('should return 200 OK', function() {
            chai.request(baseURL)
            .get('/about')
            .res(function (res) {
                expect(res).to.have.status(200);
            });
        });
    });

    describe('/:degreeTrack', function() {
        it('should return 200 OK', function() {
            chai.request(baseURL)
            .get('/json/degree1')
            .res(function (res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
            });
        });
    });
});




