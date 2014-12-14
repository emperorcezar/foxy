var assert      = require("chai").assert;
var request     = require("supertest");
var connect     = require("connect");
var http        = require("http");
var multi       = require("multiline");
var foxy        = require("../../../");
var getUrl      = require("./helpers").getUrl;

describe("Responsive images solution", function(){

    var base, app, server, serverUrl;

    before(function (done) {
        base = multi.stripIndent(function () {/*
         <img class="feature-banner__img lazyload"
         src="URL/v2/wp-content/uploads/2013/11/banner-402x134.jpg"
         data-sizes="auto"
         data-srcset="URL/v2/wp-content/uploads/2013/11/ride-banner-402x134.jpg 402w,
         URL/v2/wp-content/uploads/2013/11/ride-banner-960x320.jpg
         URL/v2/wp-content/uploads/2013/11/ride-banner-1920x640.jpg 1920w
         " alt="">
         */});
        app       = connect();
        server    = http.createServer(app).listen();
        serverUrl = getUrl(server.address().port);
        app.use("/links.html", function (req, res) {
            res.end(base.replace(/URL/g, serverUrl));
        });
        done();
    });

    after(function () {
        server.close();
    });
    it("should rewrite multiple sources", function (done) {
        request(foxy(serverUrl))
            .get("/links.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                var expected = base.replace(/URL/g, "//" + res.req._headers.host);
                assert.equal(expected, res.text);
                done();
            });
    });
});