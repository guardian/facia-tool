import GridUtil from 'grid-util-js';
import fetchMock from 'fetch-mock';
import {
  validateImageSrc,
  validateImageEvent,
  ValidationResponse,
} from 'util/validateImageSrc';
import ImageMock from 'util/ImageMock';
import grid from 'util/grid';

(global as any).Image = ImageMock;

jest.mock('constants/url', () => ({
  media: {
    imageCdnDomainExpr: new RegExp(`http://localhost`),
    imgIXDomainExpr: /http:\/\/imgix\//,
    staticImageCdnDomain: `http://localhost/base/public/test/fixtures/`,
    imageCdnDomain: 'localhost',
    mediaBaseUrl: 'http://media',
    apiBaseUrl: '/api.grid',
    usageBaseUrl: '/api/usage',
  },
}));

function getPath(image: string) {
  return `http://localhost/base/public/test/fixtures/${image}`;
}

function getImgIXPath(image: string) {
  return `http://imgix/${image}`;
}

describe('Validate images', () => {
  beforeEach(() => {
    grid.setGridInstance(
      new GridUtil({
        apiBaseUrl: '/api.grid',
      })
    );

    fetchMock.once(
      '/api/usage',
      {
        method: 'post',
      },
      {
        overwriteRoutes: true,
      }
    );

    ImageMock.restoreDefaults();
  });

  describe('- invalid', () => {
    it('missing images', (done) => {
      // Typescript -- this code is ported from v1, and we can't call validateImageSrc() without arguments in flow.
      (validateImageSrc as any)().then(
        (err: any) => done.fail(err),
        (err: Error) => {
          expect(err.message).toMatch(/missing/i);
          done();
        }
      );
    });

    it('unknown domain', (done) => {
      validateImageSrc('http://another-host/image.png').then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(/images must come/i);
          done();
        }
      );
    });
  });

  describe('- from image CDN', () => {
    it("fails if the image can't be found", (done) => {
      ImageMock.shouldError = true;
      validateImageSrc(getPath('this_image_doesnt_exists__promised.png')).then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(/could not be found/i);
          done();
        }
      );
    });

    it('fails if the image is too big', (done) => {
      const criteria = {
        maxWidth: 50,
      };
      const path = getPath('square.png');
      validateImageSrc(path, 'front', criteria).then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(/cannot be more/i);
          done();
        }
      );
    });

    it('fails if the image is too small', (done) => {
      const criteria = {
        minWidth: 200,
      };
      validateImageSrc(getPath('square.png'), 'front', criteria).then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(/cannot be less/i);
          done();
        }
      );
    });

    it('fails if the aspect ratio is wrong', (done) => {
      const criteria = {
        widthAspectRatio: 5,
        heightAspectRatio: 3,
      };

      validateImageSrc(getPath('square.png'), 'front', criteria).then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(/aspect ratio/i);
          done();
        }
      );
    });

    it('works with no criteria', (done) => {
      validateImageSrc(getPath('square.png'), 'front').then(
        (image) => {
          expect((image as ValidationResponse).width).toBe(100);
          expect((image as ValidationResponse).height).toBe(100);
          expect((image as ValidationResponse).src).toMatch(/square\.png/);
          expect((image as ValidationResponse).origin).toMatch(/square\.png/);
          done();
        },
        (err) => done.fail(err)
      );
    });

    it('works with if all criteria are met', (done) => {
      const criteria = {
        minWidth: 100,
        maxWidth: 200,
        widthAspectRatio: 1,
        heightAspectRatio: 1,
      };

      validateImageSrc(getPath('square.png'), 'front', criteria).then(
        (image) => {
          expect((image as ValidationResponse).width).toBe(100);
          expect((image as ValidationResponse).height).toBe(100);
          expect((image as ValidationResponse).src).toMatch(/square\.png/);
          expect((image as ValidationResponse).origin).toMatch(/square\.png/);
          done();
        },
        (err) => done.fail(err)
      );
    });
  });

  describe('- from imgIX', () => {
    it('strips unnecessary parameters', (done) => {
      validateImageSrc(
        getImgIXPath(
          'square.png?s=82a57a91afadd159bb4639d6b798f6c5&other=params'
        )
      ).then(
        (image) => {
          expect((image as ValidationResponse).width).toBe(100);
          expect((image as ValidationResponse).height).toBe(100);
          expect((image as ValidationResponse).src).toMatch(/square\.png$/);
          expect((image as ValidationResponse).origin).toMatch(/square\.png$/);
          done();
        },
        (err) => done.fail(err)
      );
    });
  });

  describe('- from the Grid', () => {
    it('fails if media is not accessible', (done) => {
      grid.gridInstance.getImage = () =>
        Promise.reject(new Error('error while loading'));
      validateImageSrc(
        'http://grid.co.uk/1234567890123456789012345678901234567890'
      ).then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(
            /There was a problem contacting The Grid/i
          );
          done();
        }
      );
    });

    describe('- link include crop id', () => {
      it('fails if crop id is invalid', (done) => {
        grid.gridInstance.getImage = () =>
          Promise.resolve({
            data: {
              exports: [{ id: 'nice_crop_id' }],
            },
          });

        validateImageSrc(
          'http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop',
          'front'
        ).then(
          (err) => done.fail(err.toString()),
          (err) => {
            expect(err.message).toMatch(/does not have a valid crop/i);
            done();
          }
        );
      });

      it("fails if crop doesn't respect criteria", (done) => {
        grid.gridInstance.getImage = () =>
          Promise.resolve({
            data: {
              exports: [
                {
                  id: 'image_crop',
                  assets: [
                    { dimensions: { width: 5000, height: 100 } },
                    { dimensions: { width: 500, height: 10 } },
                    { dimensions: { width: 50, height: 1 } },
                  ],
                },
              ],
            },
          });

        validateImageSrc(
          'http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop',
          'front',
          {
            minWidth: 100,
            maxWidth: 1000,
            widthAspectRatio: 5,
            heightAspectRatio: 4,
          }
        ).then(
          (err) => done.fail(err.toString()),
          (err) => {
            expect(err.message).toMatch(/does not have a valid crop/i);
            done();
          }
        );
      });

      it('gets the specified asset', (done) => {
        grid.gridInstance.getImage = () =>
          Promise.resolve({
            data: {
              exports: [
                {
                  id: 'image_crop',
                  assets: [
                    { dimensions: { width: 1400, height: 1400 } },
                    {
                      secureUrl: getPath('square.png'),
                      dimensions: { width: 140, height: 140 },
                    },
                  ],
                },
              ],
            },
          });
        ImageMock.defaultWidth = 140;
        ImageMock.defaultHeight = 140;
        validateImageSrc(
          'http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop',
          'front',
          {
            minWidth: 100,
            maxWidth: 1000,
            widthAspectRatio: 1,
            heightAspectRatio: 1,
          }
        )
          .then((image) => {
            expect((image as ValidationResponse).width).toBe(140);
            expect((image as ValidationResponse).height).toBe(140);
            expect((image as ValidationResponse).src).toMatch(/square\.png$/);
            expect((image as ValidationResponse).origin).toBe(
              'http://media/image/1234567890123456789012345678901234567890'
            );
          })
          .then(() => done())
          .catch((err) => done.fail(err));
      });
    });

    describe('- link does not include crop id', () => {
      it('fails if there are no crops', (done) => {
        ImageMock.defaultWidth = 140;
        ImageMock.defaultHeight = 140;
        grid.gridInstance.getImage = () =>
          Promise.resolve({
            data: { exports: [] },
          });

        validateImageSrc(
          'http://grid.co.uk/1234567890123456789012345678901234567890'
        ).then(
          (err) => done.fail(err.toString()),
          (err) => {
            expect(err.message).toMatch(/does not have a valid crop/i);
            done();
          }
        );
      });

      it("fails if crops don't respect criteria", (done) => {
        ImageMock.defaultWidth = 140;
        ImageMock.defaultHeight = 140;
        grid.gridInstance.getImage = () =>
          Promise.resolve({
            data: {
              exports: [
                {
                  id: 'image_crop',
                  assets: [
                    { dimensions: { width: 5000, height: 100 } },
                    { dimensions: { width: 500, height: 10 } },
                    { dimensions: { width: 50, height: 1 } },
                  ],
                },
              ],
            },
          });

        validateImageSrc(
          'http://grid.co.uk/1234567890123456789012345678901234567890',
          'front',
          {
            minWidth: 100,
            maxWidth: 1000,
            widthAspectRatio: 5,
            heightAspectRatio: 4,
          }
        ).then(
          (err) => done.fail(err.toString()),
          (err) => {
            expect(err.message).toMatch(/does not have a valid crop/i);
            done();
          }
        );
      });

      it('gets the first valid asset', (done) => {
        ImageMock.defaultWidth = 140;
        ImageMock.defaultHeight = 140;
        grid.gridInstance.getImage = () =>
          Promise.resolve({
            data: {
              exports: [
                {
                  id: 'image_crop',
                  assets: [
                    { dimensions: { width: 1400, height: 1400 } },
                    {
                      secureUrl: getPath('square.png'),
                      dimensions: { width: 140, height: 140 },
                    },
                  ],
                },
              ],
            },
          });

        validateImageSrc(
          'http://grid.co.uk/1234567890123456789012345678901234567890',
          'front',
          {
            minWidth: 100,
            maxWidth: 1000,
            widthAspectRatio: 1,
            heightAspectRatio: 1,
          }
        )
          .then((image) => {
            expect((image as ValidationResponse).width).toBe(140);
            expect((image as ValidationResponse).height).toBe(140);
            expect((image as ValidationResponse).src).toMatch(/square\.png$/);
            expect((image as ValidationResponse).origin).toBe(
              'http://media/image/1234567890123456789012345678901234567890'
            );
          })
          .then(() => done())
          .catch((err) => done.fail(err));
      });

      it('gets the first asset when no criteria', (done) => {
        ImageMock.defaultWidth = 140;
        ImageMock.defaultHeight = 140;
        grid.gridInstance.getImage = () =>
          Promise.resolve({
            data: {
              exports: [
                {
                  id: 'image_crop',
                  assets: [
                    {
                      secureUrl: getPath('square.png'),
                      dimensions: { width: 800, height: 800 },
                    },
                    {
                      secureUrl: 'thumbnail',
                      dimensions: { width: 140, height: 140 },
                    },
                  ],
                },
              ],
            },
          });

        validateImageSrc(
          'http://grid.co.uk/1234567890123456789012345678901234567890'
        )
          .then((image) => {
            expect((image as ValidationResponse).width).toBe(140);
            expect((image as ValidationResponse).height).toBe(140);
            expect((image as ValidationResponse).src).toMatch(/square\.png$/);
            expect((image as ValidationResponse).origin).toBe(
              'http://media/image/1234567890123456789012345678901234567890'
            );
            expect((image as ValidationResponse).thumb).toBe('thumbnail');
          })
          .then(() => done())
          .catch((err) => done.fail(err));
      });
    });
  });

  describe('- from copy paste event', () => {
    it('fails with invalid item', (done) => {
      grid.gridInstance.getCropFromEvent = () => null;

      validateImageEvent('front' as any, {} as any).then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(/invalid image/i);
          done();
        }
      );
    });

    it('fails when no suitable assets', (done) => {
      grid.gridInstance.getCropFromEvent = () => ({
        assets: [
          {
            secureUrl: getPath('square.png'),
            dimensions: { width: 800, height: 800 },
          },
        ],
      });

      const dragEvent: any = {};
      validateImageEvent(dragEvent, 'front', {
        maxWidth: 500,
      }).then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(/does not have a valid asset/i);
          done();
        }
      );
    });

    it("fails when the actual image doesn't validate", (done) => {
      grid.gridInstance.getCropFromEvent = () => ({
        assets: [
          {
            secureUrl: getPath('square.png'),
            dimensions: { width: 800, height: 800 },
          },
        ],
      });
      validateImageEvent({} as any, 'front', {
        widthAspectRatio: 4,
        heightAspectRatio: 1,
      }).then(
        (err) => done.fail(err.toString()),
        (err) => {
          expect(err.message).toMatch(/aspect ratio/i);
          done();
        }
      );
    });

    it('resolves correctly', (done) => {
      grid.gridInstance.getCropFromEvent = () => ({
        assets: [
          {
            secureUrl: getPath('square.png'),
            dimensions: { width: 140, height: 140 },
          },
          {
            secureUrl: getPath('thumb.png'),
            dimensions: { width: 140, height: 140 },
          },
        ],
        id: 'mediaID',
      });
      grid.gridInstance.getGridUrlFromEvent = () =>
        'http://media/image/mediaID';

      validateImageEvent({} as any, 'front', {
        widthAspectRatio: 1,
        heightAspectRatio: 1,
      })
        .then((image) => {
          expect((image as ValidationResponse).width).toBe(140);
          expect((image as ValidationResponse).height).toBe(140);
          expect((image as ValidationResponse).src).toMatch(/square\.png$/);
          expect((image as ValidationResponse).origin).toBe(
            'http://media/image/mediaID'
          );
          expect((image as ValidationResponse).thumb).toMatch(/thumb\.png$/);
        })
        .then(() => done())
        .catch((err) => done.fail(err));
    });

    it('resolves correctly when it contains a URL', (done) => {
      grid.gridInstance.getCropFromEvent = () => {};
      grid.gridInstance.getGridUrlFromEvent = () =>
        'http://grid.co.uk/1234567890123456789012345678901234567890';
      grid.gridInstance.getImage = () =>
        Promise.resolve({
          data: {
            exports: [
              {
                id: 'crop_id',
                assets: [
                  {
                    secureUrl: getPath('square.png'),
                    dimensions: { width: 800, height: 800 },
                  },
                ],
              },
            ],
          },
        });
      ImageMock.defaultWidth = 140;
      ImageMock.defaultHeight = 140;
      validateImageEvent(
        {} as any,
        {
          widthAspectRatio: 1,
          heightAspectRatio: 1,
        } as any
      )
        .then((image) => {
          expect((image as ValidationResponse).width).toBe(140);
          expect((image as ValidationResponse).height).toBe(140);
          expect((image as ValidationResponse).src).toMatch(/square\.png$/);
          expect((image as ValidationResponse).origin).toBe(
            'http://media/image/1234567890123456789012345678901234567890'
          );
          expect((image as ValidationResponse).thumb).toMatch(/square\.png$/);
        })
        .then(() => done())
        .catch((err) => done.fail(err));
    });
  });
});
