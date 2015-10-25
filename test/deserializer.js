'use strict';
/* global describe, it */

var expect = require('chai').expect;

var JsonApiDeserializer = require('../lib/deserializer');

describe('JSON API Deserializer', function () {
  describe('simple JSONAPI array document', function () {
    it('should returns attributes', function (done) {
      var dataSet = {
        data: [{
          type: 'users',
          id: '54735750e16638ba1eee59cb',
          attributes: { 'first-name': 'Sandro', 'last-name': 'Munda' }
        }, {
          type: 'users',
          id: '5490143e69e49d0c8f9fc6bc',
          attributes: { 'first-name': 'Lawrence', 'last-name': 'Bennett' }
        }]
      };

      new JsonApiDeserializer(dataSet)
        .then(function (json) {
          expect(json).to.be.an('array').with.length(2);
          expect(json[0]).to.be.eql({
            id: '54735750e16638ba1eee59cb',
            'first-name': 'Sandro',
            'last-name': 'Munda'
          });
          expect(json[1]).to.be.eql({
            id: '5490143e69e49d0c8f9fc6bc',
            'first-name': 'Lawrence',
            'last-name': 'Bennett'
          });

          done(null, json);
        });
    });
  });

  describe('simple JSONAPI single document', function () {
    it('should returns attributes', function (done) {
      var dataSet = {
        data: {
          type: 'users',
          id: '54735750e16638ba1eee59cb',
          attributes: { 'first-name': 'Sandro', 'last-name': 'Munda' }
        }
      };

      new JsonApiDeserializer(dataSet)
        .then(function (json) {
          expect(json).to.be.eql({
            id: '54735750e16638ba1eee59cb',
            'first-name': 'Sandro',
            'last-name': 'Munda'
          });

          done(null, json);
        });
    });
  });

  describe('simple JSONAPI single document', function () {
    it('should returns attributes', function (done) {
      var dataSet = {
        data: {
          type: 'users',
          id: '54735750e16638ba1eee59cb',
          attributes: { 'first-name': 'Sandro', 'last-name': 'Munda' }
        }
      };

      new JsonApiDeserializer(dataSet)
        .then(function (json) {
          expect(json).to.be.eql({
            id: '54735750e16638ba1eee59cb',
            'first-name': 'Sandro',
            'last-name': 'Munda'
          });

          done(null, json);
        });
    });
  });

  describe('Nested documents', function () {
    it('should returns attributes', function (done) {
      var dataSet = {
        data: [{
          type: 'users',
          id: '54735750e16638ba1eee59cb',
          attributes: {
            'first-name': 'Sandro',
            'last-name': 'Munda',
            books: [{
              title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
              isbn: '978-0062301239'
            }, {
              title: 'Steve Jobs',
              isbn: '978-1451648546'
            }]
          }
        }, {
          type: 'users',
          id: '5490143e69e49d0c8f9fc6bc',
          attributes: {
            'first-name': 'Lawrence',
            'last-name': 'Bennett',
            books: [{
              title: 'Zero to One: Notes on Startups, or How to Build the Future',
              isbn: '978-0804139298'
            }, {
              title: 'Einstein: His Life and Universe',
              isbn: '978-0743264747'
            }]
          }
        }]
      };

      new JsonApiDeserializer(dataSet)
        .then(function (json) {
          expect(json).to.be.an('array').with.length(2);

          expect(json[0]).to.have.key('id', 'first-name', 'last-name', 'books');
          expect(json[0].books).to.be.an('array');
          expect(json[0].books[0]).to.be.eql({
            title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
            isbn: '978-0062301239'
          });
          expect(json[0].books[1]).to.be.eql({
            title: 'Steve Jobs',
            isbn: '978-1451648546'
          });

          expect(json[1]).to.have.key('id', 'first-name', 'last-name',
            'books');
          done(null, json);
        });
    });
  });

  describe('Compound document', function () {
    it('should merge included relationships to attributes', function (done) {
      var dataSet = {
        data: [{
          type: 'users',
          id: '54735750e16638ba1eee59cb',
          attributes: {
            'first-name': 'Sandro',
            'last-name': 'Munda'
          },
          relationships: {
            address: {
              data: { type: 'addresses', id: '54735722e16620ba1eee36af' }
            }
          }
        }, {
          type: 'users',
          id: '5490143e69e49d0c8f9fc6bc',
          attributes: {
            'first-name': 'Lawrence',
            'last-name': 'Bennett'
          },
          relationships: {
            address: {
              data: { type: 'addresses', id: '54735697e16624ba1eee36bf' }
            }
          }
        }],
        included: [{
          type: 'addresses',
          id: '54735722e16620ba1eee36af',
          attributes: {
            'address-line1': '406 Madison Court',
            'zip-code': '49426',
            country: 'USA'
          }
        }, {
          type: 'addresses',
          id: '54735697e16624ba1eee36bf',
          attributes: {
            'address-line1': '361 Shady Lane',
            'zip-code': '23185',
            country: 'USA'
          }
        }]
      };

      new JsonApiDeserializer(dataSet)
      .then(function (json) {
        expect(json).to.be.an('array').with.length(2);

        expect(json[0]).to.have.key('id', 'first-name', 'last-name',
          'address');

        expect(json[0].address).to.be.eql({
          id: '54735722e16620ba1eee36af',
          'address-line1': '406 Madison Court',
          'zip-code': '49426',
          country: 'USA'
        });

        expect(json[1]).to.have.key('id', 'first-name', 'last-name',
          'address');

        expect(json[1].address).to.be.eql({
          id: '54735697e16624ba1eee36bf',
          'address-line1': '361 Shady Lane',
          'zip-code': '23185',
          country: 'USA'
        });

        done(null, json);
      });
    });

    describe('With multiple levels', function () {
      it('should merge all include relationships to attributes', function (done) {
        var dataSet = {
          data: [{
            type: 'users',
            id: '54735750e16638ba1eee59cb',
            attributes: {
              'first-name': 'Sandro',
              'last-name': 'Munda'
            },
            relationships: {
              address: {
                data: { type: 'addresses', id: '54735722e16620ba1eee36af' }
              }
            }
          }, {
            type: 'users',
            id: '5490143e69e49d0c8f9fc6bc',
            attributes: {
              'first-name': 'Lawrence',
              'last-name': 'Bennett'
            },
            relationships: {
              address: {
                data: { type: 'addresses', id: '54735697e16624ba1eee36bf' }
              }
            }
          }],
          included: [{
            type: 'addresses',
            id: '54735722e16620ba1eee36af',
            attributes: {
              'address-line1': '406 Madison Court',
              'zip-code': '49426',
              country: 'USA'
            },
            relationships: {
              lock: { data: { type: 'lock', id: '1' } }
            }
          }, {
            type: 'addresses',
            id: '54735697e16624ba1eee36bf',
            attributes: {
              'address-line1': '361 Shady Lane',
              'zip-code': '23185',
              country: 'USA'
            },
            relationships: {
              lock: {
                data: { type: 'lock', id: '2' }
              }
            }
          }, {
            type: 'lock',
            id: '1',
            attributes: {
              secretKey: 'S*7v0oMf7YxCtFyA$ffy'
            },
            relationships: {
              key: {
                data: { type: 'key', id: '1' }
              }
            }
          }, {
            type: 'key',
            id: '1',
            attributes: {
              publicKey: '1*waZCXVE*XXpn*Izc%t'
            }
          }]
        };

        new JsonApiDeserializer(dataSet)
        .then(function (json) {
          expect(json).to.be.an('array').with.length(2);

          expect(json[0]).to.have.key('id', 'first-name', 'last-name',
            'address');

          expect(json[0].address).to.be.eql({
            'address-line1': '406 Madison Court',
            'zip-code': '49426',
            country: 'USA',
            id: '54735722e16620ba1eee36af',
            lock: {
              id: '1',
              secretKey: 'S*7v0oMf7YxCtFyA$ffy',
              key: {
                id: '1',
                publicKey: '1*waZCXVE*XXpn*Izc%t'
              }
            }
          });

          expect(json[1]).to.have.key('id', 'first-name', 'last-name',
            'address');

          expect(json[1].address).to.be.eql({
            id: '54735697e16624ba1eee36bf',
            'address-line1': '361 Shady Lane',
            'zip-code': '23185',
            country: 'USA'
          });

          done();
        });
      });
    });

    describe('With relationships data array', function () {
      it('should merge included relationships to attributes', function (done) {
        var dataSet = {
          data: [{
            type: 'users',
            id: '54735750e16638ba1eee59cb',
            attributes: {
              'first-name': 'Sandro',
              'last-name': 'Munda'
            },
            relationships: {
              address: {
                data: { type: 'addresses', id: '54735722e16620ba1eee36af' }
              }
            }
          }, {
            type: 'users',
            id: '5490143e69e49d0c8f9fc6bc',
            attributes: {
              'first-name': 'Lawrence',
              'last-name': 'Bennett'
            },
            relationships: {
              address: {
                data: { type: 'addresses', id: '54735697e16624ba1eee36bf' }
              }
            }
          }],
          included: [{
            type: 'addresses',
            id: '54735722e16620ba1eee36af',
            attributes: {
              'address-line1': '406 Madison Court',
              'zip-code': '49426',
              country: 'USA'
            },
            relationships: {
              locks: {
                data: [{ type: 'lock', id: '1' }, { type: 'lock', id: '2' }]
              }
            }
          }, {
            type: 'addresses',
            id: '54735697e16624ba1eee36bf',
            attributes: {
              'address-line1': '361 Shady Lane',
              'zip-code': '23185',
              country: 'USA'
            }
          }, {
            type: 'lock',
            id: '1',
            attributes: {
              secretKey: 'S*7v0oMf7YxCtFyA$ffy'
            }
          }, {
            type: 'lock',
            id: '2',
            attributes: {
              secretKey: 'En8zd6ZT6#q&Fz^EwGMy'
            }
          }]
        };

        new JsonApiDeserializer(dataSet)
        .then(function (json) {
          expect(json).to.be.an('array').with.length(2);

          expect(json[0]).to.have.key('id', 'first-name', 'last-name',
            'address');

          expect(json[0].address).to.be.eql({
            'address-line1': '406 Madison Court',
            'zip-code': '49426',
            country: 'USA',
            id: '54735722e16620ba1eee36af',
            locks: [
              { secretKey: 'S*7v0oMf7YxCtFyA$ffy', id: '1' },
              { secretKey: 'En8zd6ZT6#q&Fz^EwGMy', id: '2' }
            ]
          });

          expect(json[1]).to.have.key('id', 'first-name', 'last-name',
            'address');

          expect(json[1].address).to.be.eql({
            id: '54735697e16624ba1eee36bf',
            'address-line1': '361 Shady Lane',
            'zip-code': '23185',
            country: 'USA'
          });

          done(null, json);
        });
      });
    });

    describe('Without included', function () {
      it('should use the value of valueForRelationship opt', function (done) {
        var dataSet = {
          data: [{
            type: 'users',
            id: '54735750e16638ba1eee59cb',
            attributes: {
              'first-name': 'Sandro',
              'last-name': 'Munda'
            },
            relationships: {
              address: {
                data: { type: 'addresses', id: '54735722e16620ba1eee36af' }
              }
            }
          }, {
            type: 'users',
            id: '5490143e69e49d0c8f9fc6bc',
            attributes: {
              'first-name': 'Lawrence',
              'last-name': 'Bennett'
            },
            relationships: {
              address: {
                data: { type: 'addresses', id: '54735697e16624ba1eee36bf' }
              }
            }
          }]
        };

        new JsonApiDeserializer(dataSet, {
          addresses: {
            valueForRelationship: function (relationship) {
              return {
                id: relationship.id,
                'address-line1': '406 Madison Court',
                'zip-code': '49426',
                country: 'USA'
              };
            }
          }
        })
        .then(function (json) {
          expect(json).to.be.an('array').with.length(2);

          expect(json[0]).to.have.key('id', 'first-name', 'last-name',
            'address');

          expect(json[0].address).to.be.eql({
            id: '54735722e16620ba1eee36af',
            'address-line1': '406 Madison Court',
            'zip-code': '49426',
            country: 'USA'
          });

          expect(json[1]).to.have.key('id', 'first-name', 'last-name',
            'address');

          expect(json[1].address).to.be.eql({
            id: '54735697e16624ba1eee36bf',
            'address-line1': '406 Madison Court',
            'zip-code': '49426',
            country: 'USA'
          });

          done(null, json);
        });
      });
    });
  });
});
