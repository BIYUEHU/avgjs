import { Visual } from 'misakura';

const visual = new Visual();

visual.view();

visual.background('/images/bg.png');
await visual.text(
  '这是一串非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的文本'
);

const c1 = visual.character('neri', {
  assets: '/images/character/c1.png',
});

await c1.text('hi');
c1.view();
await c1.text('这是一个对话测试');
await c1.text('这也是一个对话测试');
await c1.text('bye~~');
c1.hide();
await visual.text('ending...');
