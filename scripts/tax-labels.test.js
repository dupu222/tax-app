import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { displayIncomeCategory, displayIncomeType } from '../src/utils/tax-labels.js';

describe('收入纳税明细展示文案', () => {
  it('列表标题把工资薪金所得显示为工资薪金', () => {
    assert.equal(displayIncomeType('工资薪金所得'), '工资薪金');
    assert.equal(displayIncomeType('劳务报酬所得'), '劳务报酬所得');
  });

  it('所得项目小类把全年一次性奖金显示为全年一次性奖金收入', () => {
    assert.equal(displayIncomeCategory('全年一次性奖金'), '全年一次性奖金收入');
    assert.equal(displayIncomeCategory('正常工资薪金'), '正常工资薪金');
  });
});
