// Theme boot — vanilla. No jQuery, no Slick.
// Replaces the former `$(boot)` / `$(window).on('load')` pattern.

import { languageflag } from './modules/lang';
import { initAllSliders, refreshAllSliders } from './modules/carousel';
import { flashDealsCountdown, destroyFlashDealsCountdown } from './modules/flash-deals-countdown';
import { tabList, accordionTabs } from './modules/tabs';
import Wishlist from './modules/wishlist.js';
import SwatchHover from './modules/swatch-hover.js';
import MobileDrawer from './modules/mobile-drawer.js';
import CartDrawerWire from './modules/cart-drawer-wire.js';
import QuickView from './modules/quick-view.js';
import CategoriesMenu from './modules/categories-menu.js';
import CookieConsent from './modules/cookie-consent.js';
import FreeShippingBar from './modules/free-shipping-bar.js';
import SocialProof from './modules/social-proof.js';
import HeaderFixed from './modules/header-fixed.js';
import NewsletterPopup from './modules/newsletter-popup.js';
import HeaderTopDropdown from './modules/header-top-dropdown.js';
import CollectionView from './modules/collection-view.js';
import CartPage from './modules/cart-page.js';
import HeaderAccount from './modules/header-account.js';
import MiniCart from './modules/mini-cart.js';
import DealProduct from './modules/deal-product.js';
import ProductBundle from './modules/product-bundle.js';
import SalesPopup from './modules/sales-popup.js';
import CardActions from './modules/card-actions.js';
import WishlistPage from './modules/wishlist-page.js';
import ComparePage from './modules/compare-page.js';
import OcTabs from './modules/oc-tabs.js';
import OcNotify from './modules/oc-notify.js';
import MegaFit from './modules/mega-fit.js';
import './modules/tm-scroller.js'; // defines <tm-scroller>
import { formatMoney } from './modules/money.js';

window.TmMoney = { formatMoney }; // for inline section scripts (PDP)

const initThemeScripts = () => {
  languageflag();
  initAllSliders();
  flashDealsCountdown();
  tabList();
  accordionTabs();
  Wishlist.init();
  SwatchHover.init();
  MobileDrawer.init();
  CartDrawerWire.init();
  QuickView.init();
  CategoriesMenu.init();
  CookieConsent.init();
  FreeShippingBar.init();
  SocialProof.init();
  HeaderFixed.init();
  NewsletterPopup.init();
  HeaderTopDropdown.init();
  CollectionView.init();
  CartPage.init();
  HeaderAccount.init();
  MiniCart.init();
  DealProduct.init();
  ProductBundle.init();
  SalesPopup.init();
  CardActions.init();
  MegaFit.init();
  WishlistPage.init();
  ComparePage.init();
  OcTabs.init();
  OcNotify.init();
};

const onReady = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
};

onReady(initThemeScripts);

window.addEventListener('load', () => {
  // `load` runs after images/fonts settle — re-poke sliders so they reflect
  // any post-paint layout shifts. Cheap no-op when nothing changed.
  refreshAllSliders();
});

document.addEventListener('shopify:section:load', () => {
  // Theme Editor re-renders a section: clear timers, then re-run init.
  setTimeout(() => {
    destroyFlashDealsCountdown();
    document.querySelectorAll('[data-tabs-root][data-tabs-init]').forEach((root) => {
      delete root.dataset.tabsInit;
    });
    initThemeScripts();
  }, 50);
});

// Content injected client-side (e.g. Recently Viewed cards) — bind card behaviours only.
document.addEventListener('tm:content-loaded', () => {
  Wishlist.init();
  SwatchHover.init();
  QuickView.init();
  CardActions.init();
});

document.addEventListener('shopify:section:reorder', () => {
  setTimeout(initThemeScripts, 50);
});
