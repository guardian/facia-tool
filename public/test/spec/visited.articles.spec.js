import Page from 'test/utils/page';
import * as wait from 'test/utils/wait';
import {CONST} from 'modules/vars';

describe('Visited articles', function () {
    beforeEach(function (done) {
        this.originalDetectPendingChangesInClipboard = CONST.detectPendingChangesInClipboard;
        CONST.detectPendingChangesInClipboard = 300;
        this.testPage = new Page('/test?layout=latest,front:uk', {}, done);
    });
    afterEach(function (done) {
        CONST.detectPendingChangesInClipboard = this.originalDetectPendingChangesInClipboard;
        this.testPage.dispose(done);
    });

    it('marks an article visited from visited articles list as visited', function (done) {
        this.testPage.regions.latest().trail(1).copyToClipboard()
        .then(trail => trail.openLink())
        .then(trailInLatest => {
            const trailInFirstCollection = this.testPage.regions.front().collection(1).group(1).trail(1);
            const trailInClipboard = this.testPage.regions.clipboard().trail(1);

            expect(trailInLatest.opacity()).toBeCloseTo(0.6, 2);
            expect(trailInFirstCollection.opacity()).toBeCloseTo(1);
            expect(trailInClipboard.opacity()).toBeCloseTo(1);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('marks an article visited from clipboard as visited in visited articles list', function (done) {
        this.testPage.regions.latest().trail(1).copyToClipboard()
        .then(() => this.testPage.regions.clipboard().trail(1).openLink())
        .then(trailInClipboard => {
            const trailInFirstCollection = this.testPage.regions.front().collection(1).group(1).trail(1);
            const trailInLatest = this.testPage.regions.latest().trail(1);

            expect(trailInLatest.opacity()).toBeCloseTo(0.6);
            expect(trailInFirstCollection.opacity()).toBeCloseTo(1);
            expect(trailInClipboard.opacity()).toBeCloseTo(1);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('displays article as visited after redrawing data', function (done) {
        this.testPage.regions.latest().trail(1).copyToClipboard()
        .then(trail => trail.openLink())
        .then(() => wait.ms(CONST.detectPendingChangesInClipboard + 50))
        .then(() => this.testPage.reload())
        .then(() => {
            const trailInFirstCollection = this.testPage.regions.front().collection(1).group(1).trail(1);
            const trailInLatest = this.testPage.regions.latest().trail(1);
            const trailInClipboard = this.testPage.regions.clipboard().trail(1);

            expect(trailInLatest.opacity()).toBeCloseTo(0.6);
            expect(trailInFirstCollection.opacity()).toBeCloseTo(1);
            expect(trailInClipboard.opacity()).toBeCloseTo(1);
        })
        .then(() => done())
        .catch(done.fail);
    });
});

