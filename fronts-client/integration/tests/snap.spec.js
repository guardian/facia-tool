import setup from '../server/setup';
import teardown from '../server/teardown';
import {
  frontDropZone,
  frontSnapLink,
  guardianSnapLink,
  externalSnapLink,
  clipboardWrapper,
  collection,
  cardDeleteButton,
  optionsModalChoice,
  dragToAddSnapItem,
  allSnaps
} from '../selectors';

fixture`Fronts edit`.page`http://localhost:3456/v2/email`
  .before(setup)
  .after(teardown);

test("Drag from 'drag to add text snap' item to create text snap", async t => {
  const firstCollectionSnapCount = await allSnaps(0).count;
  await t
    .dragToElement(dragToAddSnapItem(), collection(0))
    .expect(allSnaps(0).count)
    .eql(firstCollectionSnapCount + 1);
});

test('Snap Links - Guardian', async t => {
  const frontDropsCount = await frontDropZone().count;
  const tagSnap = await guardianSnapLink();
  await t
    .dragToElement(tagSnap, frontDropZone(1)) //drag tag into parent position (not a sublink)
    .click(optionsModalChoice('options-modal-link'))
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 2) // adding a sublink adds 1 dropzone, adding a normal article adds 2
    .expect(frontSnapLink(0).textContent)
    .contains('Recipes | The Guardian')
    .expect(frontSnapLink(0).textContent)
    .notContains('Latest');
});

test('Snap Links - Guardian Latest', async t => {
  const frontDropsCount = await frontDropZone().count;
  const tagSnap = await guardianSnapLink();
  await t
    .dragToElement(tagSnap, frontDropZone(1))
    .click(optionsModalChoice('options-modal-latest-from'))
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 2)
    .expect(frontSnapLink(0).textContent)
    .contains('{ Recipes }')
    .expect(frontSnapLink(0).textContent)
    .contains('Latest');
});

test('Snap Links - External', async t => {
  const frontDropsCount = await frontDropZone().count;
  const externalSnap = await externalSnapLink();
  await t
    .setNativeDialogHandler(() => false)
    .dragToElement(externalSnap, frontDropZone(1))
    .expect(frontDropZone().count)
    .eql(frontDropsCount + 2)
    .expect(frontSnapLink(0).textContent)
    .contains('Business - BBC News');
});
