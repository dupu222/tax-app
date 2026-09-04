import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NEWS_TABS, QUICK_CARDS, SEARCH_FUNCTIONS } from '../src/views/tabbar/home/home-data.js';

describe('latest home data', () => {
  it('keeps the four official quick cards and routes', () => {
    assert.deepEqual(
      QUICK_CARDS.map((item) => [item.title, item.action, item.routeName]),
      [
        ['综合所得年度汇算', '去申报', 'EmptyPage'],
        ['收入纳税明细', '去查询', 'TaxDeatilsSearch'],
        ['纳税记录开具', '去开具', 'HtRecordsOpener'],
        ['更多功能', '去设置', 'HandleTax'],
      ],
    );
  });

  it('covers the four news tabs from the latest official homepage', () => {
    assert.deepEqual(
      NEWS_TABS.map((item) => item.label),
      ['警示案例', '通知公告', '热点问题', '政策解读'],
    );
  });

  it('lets search jump into existing tax functions', () => {
    const titles = SEARCH_FUNCTIONS.map((item) => item.title);
    assert.equal(titles.includes('收入纳税明细'), true);
    assert.equal(titles.includes('纳税记录开具'), true);
  });
});
