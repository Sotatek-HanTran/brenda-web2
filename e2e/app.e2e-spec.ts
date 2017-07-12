import { BrendaWeb2Page } from './app.po';

describe('brenda-web2 App', () => {
  let page: BrendaWeb2Page;

  beforeEach(() => {
    page = new BrendaWeb2Page();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
