const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");
const Page = require("./helpers/CustomPage");

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000/");
});

afterEach(async () => {
  await page.close();
});

test("the header has correct test", async () => {
  const text = await page.getContentsOf("a.brand-logo");

  expect(text).toEqual("Blogster");
});

test("clicking login starts outh flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("show logout button when the user is signed in", async () => {
  await page.login();

  const text = await page.$eval("a[href='/auth/logout'", (el) => el.innerHTML);

  expect(text).toEqual("Logout");
});