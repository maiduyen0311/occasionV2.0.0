(function($) {
    if ($(".collection-sidebar")) {
        //work only in collection page
        History.Adapter.bind(window, 'statechange', function() {
            var State = History.getState();
            if (!occasion.isSidebarAjaxClick) {
                occasion.sidebarParams();
                var newurl = occasion.sidebarCreateUrl();
                occasion.sidebarGetContent(newurl);
                occasion.reActivateSidebar();
            }
            occasion.isSidebarAjaxClick = false;
        });
    }

    if (window.use_color_swatch) {
        $('.swatch :radio').change(function() {
            var optionIndex = $(this).closest('.swatch').attr('data-option-index');
            var optionValue = $(this).val();
            $(this)
                .closest('form')
                .find('.single-option-selector')
                .eq(optionIndex)
                .val(optionValue)
                .trigger('change');
        });

        // (c) Copyright 2014 Caroline Schnapp. All Rights Reserved. Contact: mllegeorgesand@gmail.com
        // See http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options

        Shopify.optionsMap = {};

        Shopify.updateOptionsInSelector = function(selectorIndex) {

            switch (selectorIndex) {
                case 0:
                    var key = 'root';
                    var selector = $('.single-option-selector:eq(0)');
                    break;
                case 1:
                    var key = $('.single-option-selector:eq(0)').val();
                    var selector = $('.single-option-selector:eq(1)');
                    break;
                case 2:
                    var key = $('.single-option-selector:eq(0)').val();
                    key += ' / ' + $('.single-option-selector:eq(1)').val();
                    var selector = $('.single-option-selector:eq(2)');
            }

            var initialValue = selector.val();
            selector.empty();
            var availableOptions = Shopify.optionsMap[key];
            if (availableOptions && availableOptions.length) {
              for (var i = 0; i < availableOptions.length; i++) {
                  var option = availableOptions[i];
                  var newOption = $('<option></option>').val(option).html(option);
                  selector.append(newOption);
              }
              $('.swatch[data-option-index="' + selectorIndex + '"] .swatch-element').each(function() {
                  if ($.inArray($(this).attr('data-value'), availableOptions) !== -1) {
                      $(this).removeClass('soldout').show().find(':radio').removeAttr('disabled', 'disabled').removeAttr('checked');
                  } else {
                      $(this).addClass('soldout').show().find(':radio').removeAttr('checked').attr('disabled', 'disabled');
                  }
              });
              if ($.inArray(initialValue, availableOptions) !== -1) {
                  selector.val(initialValue);
              }
              selector.trigger('change');
            }
        };

        Shopify.linkOptionSelectors = function(product) {
            // Building our mapping object.
            for (var i = 0; i < product.variants.length; i++) {
                var variant = product.variants[i];
                if (variant.available) {
                    // Gathering values for the 1st drop-down.
                    Shopify.optionsMap['root'] = Shopify.optionsMap['root'] || [];
                    Shopify.optionsMap['root'].push(variant.option1);
                    Shopify.optionsMap['root'] = Shopify.uniq(Shopify.optionsMap['root']);
                    // Gathering values for the 2nd drop-down.
                    if (product.options.length > 1) {
                        var key = variant.option1;
                        Shopify.optionsMap[key] = Shopify.optionsMap[key] || [];
                        Shopify.optionsMap[key].push(variant.option2);
                        Shopify.optionsMap[key] = Shopify.uniq(Shopify.optionsMap[key]);
                    }
                    // Gathering values for the 3rd drop-down.
                    if (product.options.length === 3) {
                        var key = variant.option1 + ' / ' + variant.option2;
                        Shopify.optionsMap[key] = Shopify.optionsMap[key] || [];
                        Shopify.optionsMap[key].push(variant.option3);
                        Shopify.optionsMap[key] = Shopify.uniq(Shopify.optionsMap[key]);
                    }
                }
            }
            // Update options right away.
            Shopify.updateOptionsInSelector(0);
            if (product.options.length > 1) Shopify.updateOptionsInSelector(1);
            if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
            // When there is an update in the first dropdown.
            $(".single-option-selector:eq(0)").change(function() {
                Shopify.updateOptionsInSelector(1);
                if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
                return true;
            });
            // When there is an update in the second dropdown.
            $(".single-option-selector:eq(1)").change(function() {
                if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
                return true;
            });

        };
    }

    $(document).ready(function() {
        occasion.init();
    });


    $(window).scroll(function() {
        if ($(this).scrollTop() > 200) {
            $('#back-top').fadeIn();
        } else {
            $('#back-top').fadeOut();
        }
    });

    if (!$(".header-mobile").is(":visible")) {
        $(document).on('click touchstart', function(e) {
            var quickview = $(".quick-view");
            var dropdowncart = $(".dropdown-cart");
            var cartButton = $(".cartToggle");
            var newsletter = $("#email-modal .modal-window");
            var searchBar = $(".nav-search");
            //close quickview and dropdowncart when clicking outside
            if (!quickview.is(e.target) && quickview.has(e.target).length === 0 && !dropdowncart.is(e.target) && dropdowncart.has(e.target).length === 0 && !cartButton.is(e.target) && cartButton.has(e.target).length === 0 && !newsletter.is(e.target) && newsletter.has(e.target).length === 0 && !searchBar.is(e.target) && searchBar.has(e.target).length === 0) {
                occasion.closeQuickViewPopup();
                occasion.closeDropdownCart();
                occasion.closeEmailModalWindow();
                occasion.closeDropdownSearch();
            }
        });
    }

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            occasion.closeQuickViewPopup();
            occasion.closeDropdownCart();
            occasion.closeDropdownSearch();
            clearTimeout(occasion.occasionTimeout);
            if ($('.modal').is(':visible')) {
                $('.modal').fadeOut(500);
            }
        }
    });

    var occasion = {
        occasionTimeout: null,
        isSidebarAjaxClick: false,
        init: function() {
            this.initColorSwatchGrid();
            this.initMobileMenu();
            this.initSidebar();
            this.initMobileSidebar();
            this.initScrollTop();
            this.initQuickView();
            this.initCloudzoom();
            this.initAddToCart();
            this.initModal();
            this.initProductAddToCart();
            this.initDropDownCart();
            this.initDropdownSearch();
            this.initToggleCollectionPanel();
            this.initWishlist();
            this.initProductWishlist();
            this.initRemoveWishlist();
            this.initInfiniteScrolling();
          	this.initCartQty();
          	this.InitProductTabs();
            this.InitProductTabs2();
            this.InitProductTabs3();
          	this.InitProductTabsBottom();
            this.InitProductTabsBottom2();
            if($('.brands-page').length) {
              this.show_brands();
            };

        },
        sidebarMapTagEvents: function() {
          	$('.sidebar-tag a:not(".clear"), .sidebar-tag label').click(function(e) {
                var currentTags = [];
                if (Shopify.queryParams.constraint) {
                    currentTags = Shopify.queryParams.constraint.split('+');
                }

                //one selection or multi selection
                if (!window.enable_sidebar_multiple_choice && !$(this).prev().is(":checked")) {
                    //remove other selection first
                    var otherTag = $(this).parents('.sidebar-tag').find("input:checked");
                    if (otherTag.length > 0) {
                        var tagName = otherTag.val();
                        if (tagName) {
                            var tagPos = currentTags.indexOf(tagName);
                            if (tagPos >= 0) {
                                //remove tag
                                currentTags.splice(tagPos, 1);
                            }
                        }
                    }
                }

                var tagName = $(this).prev().val();
                if (tagName) {
                    var tagPos = currentTags.indexOf(tagName);
                    if (tagPos >= 0) {
                        //tag already existed, remove tag
                        currentTags.splice(tagPos, 1);
                    } else {
                        //tag not existed
                        currentTags.push(tagName);
                    }
                }
                if (currentTags.length) {
                    Shopify.queryParams.constraint = currentTags.join('+');
                } else {
                    delete Shopify.queryParams.constraint;
                }
                occasion.sidebarAjaxClick();
                e.preventDefault();
            });
        },
      	initCartQty: function() {
          if (jQuery('body').hasClass('template-cart')) {
            $('.button').click(function(event) {
                event.preventDefault();
                jQuery(this).each(function() {
                  var productItem = jQuery(this).parents('.product-item');
                  var productId = jQuery(productItem).attr('id');
                  productId = productId.match(/\d+/g);

                  var oldValue = jQuery('#updates_' + productId + '').val(),
                      newVal = 1;

                  if (jQuery(this).text() == "+") {
                      newVal = parseInt(oldValue) + 1;
                    } else if (oldValue > 1) {
                      newVal = parseInt(oldValue) - 1;
                  }

                  jQuery('#updates_' + productId + '').val(newVal);
                  
                  if ($('.cart-list').find(".total-price").length > 0) {
                      minimart.updatePricingCart(productId);
                  }
                });
                return false;
            });
          };
        },
        sidebarMapCategories: function() {
            $(".collection-sidebar .sidebar-links a").click(function(e) {
                if (!$(this).hasClass('active')) {
                    delete Shopify.queryParams.q;
                    occasion.sidebarAjaxClick($(this).attr('href'));

                    //activate selected category
                    $(".collection-sidebar  .sidebar-links a.active").removeClass("active");
                    $(this).addClass("active");
                }
                e.preventDefault();
            });
          
            $(".sidebar-links li .caret").click(function(event){
              var caret = $(this).parent();
              
              if (caret.hasClass("click")) {
                caret.removeClass("click");
              }
              
              else {
                caret.addClass("click");
              }      
              
              event.preventDefault();
              
            });
        },
        sidebarMapView: function() {
            $(".view-mode a").click(function(e) {
                if (!$(this).hasClass("active")) {
                    var paging = $(".filter-show > button span").text();
                    if ($(this).hasClass("list")) {
                        Shopify.queryParams.view = "list" + paging;
                    } else {
                        Shopify.queryParams.view = paging;
                    }

                    occasion.sidebarAjaxClick();
                    $(".view-mode a.active").removeClass("active");
                    $(this).addClass("active");
                }
                e.preventDefault();
            });
        },
        sidebarMapShow: function() {
            $(".filter-show a").click(function(e) {
                if (!$(this).parent().hasClass("active")) {
                    var thisPaging = $(this).attr('href');

                    var view = $(".view-mode a.active").attr("href");
                    if (view == "list") {
                        Shopify.queryParams.view = "list" + thisPaging;
                    } else {
                        Shopify.queryParams.view = thisPaging;
                    }

                    occasion.sidebarAjaxClick();
                    $(".filter-show > button span").text(thisPaging);
                    $(".filter-show li.active").removeClass("active");
                    $(this).parent().addClass("active");
                }
                e.preventDefault();
            });
        },
        sidebarInitToggle: function() {
          $('.sidebar_toggle .widget-title').addClass('click');
          $(".sidebar_toggle .widget-title h3").off().click(function() {


            var $title = $(this).parents('.widget-title');

            if ($title.hasClass('click')) {
              $title.removeClass('click');
              
            } else {
              $title.addClass('click');

            }

            $(this).parents(".sidebar_toggle").find(".widget-content").slideToggle();

          });
          if ($(window).innerWidth() <= 1024) { 
            $(".widget-featured-product .widget-title h3").click(function() {
              setTimeout(function(){
                $('.widget-featured-product .products-grid').slick("getSlick").refresh();
              },50);
            });

          }
        },
        sidebarMapSorting: function(e) {
            $(".filter-sortby li span").click(function(e) {
                if (!$(this).parent().hasClass("active")) {
                    Shopify.queryParams.sort_by = $(this).attr("data-href");
                    occasion.sidebarAjaxClick();
                    var sortbyText = $(this).text();
                    $(".filter-sortby > button span").text(sortbyText);
                    $(".filter-sortby li.active").removeClass("active");
                    $(this).parent().addClass("active");
                }
                e.preventDefault();
            });
        },
        sidebarMapPaging: function() {
            $(".pagination-page a").click(function(e) {
                var page = $(this).attr("href").match(/page=\d+/g);
                if (page) {
                    Shopify.queryParams.page = parseInt(page[0].match(/\d+/g));
                    if (Shopify.queryParams.page) {
                        var newurl = occasion.sidebarCreateUrl();
                        occasion.isSidebarAjaxClick = true;
                        History.pushState({
                            param: Shopify.queryParams
                        }, newurl, newurl);
                      
                        occasion.sidebarGetContent(newurl);
                        //product review
                        if ($(".spr-badge").length > 0) {
                          return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                        }
                        //go to top
                        $('body,html').animate({
                            scrollTop: 500
                        }, 600);
                    }
                }
                e.preventDefault();
            });
        },
        sidebarMapClearAll: function() {
            //clear all selection
            $('.refined-widgets a.clear-all').click(function(e) {
                delete Shopify.queryParams.constraint;
                delete Shopify.queryParams.q;
                occasion.sidebarAjaxClick();
                e.preventDefault();
            });
        },
      ClearSelected: function(){
          	$('.selected-tag a').click(function(e) {
                var currentTags = [];
                if (Shopify.queryParams.constraint) {
                    currentTags = Shopify.queryParams.constraint.split('+');
                }

                //one selection or multi selection
                if (!window.enable_sidebar_multiple_choice && !$(this).prev().is(":checked")) {
                    //remove other selection first
                    var otherTag = $(this).parents('.selected-tag').find("input:checked");
                    if (otherTag.length > 0) {
                        var tagName = otherTag.val();
                        if (tagName) {
                            var tagPos = currentTags.indexOf(tagName);
                            if (tagPos >= 0) {
                                //remove tag
                                currentTags.splice(tagPos, 1);
                            }
                        }
                    }
                }

                var tagName = $(this).prev().val();
                if (tagName) {
                    var tagPos = currentTags.indexOf(tagName);
                    if (tagPos >= 0) {
                        //tag already existed, remove tag
                        currentTags.splice(tagPos, 1);
                    } else {
                        //tag not existed
                        currentTags.push(tagName);
                    }
                }
                if (currentTags.length) {
                    Shopify.queryParams.constraint = currentTags.join('+');
                } else {
                    delete Shopify.queryParams.constraint;
                }
                occasion.sidebarAjaxClick();
                e.preventDefault();
            });
      },      
        sidebarMapClear: function() {
            $(".sidebar-tag").each(function() {
                var sidebarTag = $(this);
                if (sidebarTag.find("input:checked").length > 0) {
                    //has active tag
                    sidebarTag.find(".clear").show().click(function(e) {
                      
                        var currentTags = [];
                        if (Shopify.queryParams.constraint) {
                            currentTags = Shopify.queryParams.constraint.split('+');
                        }
                        sidebarTag.find("input:checked").each(function() {
                            var selectedTag = $(this);
                            var tagName = selectedTag.val();
                            if (tagName) {
                                var tagPos = currentTags.indexOf(tagName);
                                if (tagPos >= 0) {
                                    //remove tag
                                    currentTags.splice(tagPos, 1);
                                }
                            }
                        });
                        if (currentTags.length) {
                            Shopify.queryParams.constraint = currentTags.join('+');
                        } else {
                            delete Shopify.queryParams.constraint;
                        }
						occasion.sidebarAjaxClick();
                        e.preventDefault();
                    });
                }
            });
        },
        sidebarMapEvents: function() {
            occasion.sidebarMapTagEvents();
            occasion.sidebarMapCategories();
            occasion.sidebarMapView();
            occasion.sidebarMapShow();
            occasion.sidebarMapSorting();
        },
        reActivateSidebar: function() {
            $(".sidebar-custom .active, .sidebar-links .active").removeClass("active");
            $(".sidebar-tag input:checked").attr("checked", false);

            //category
            var cat = location.pathname.match(/\/collections\/(.*)(\?)?/);
            if (cat && cat[1]) {
                $(".sidebar-links a[href='" + cat[0] + "']").addClass("active");
            }

            //view mode and show filter
            if (Shopify.queryParams.view) {
                $(".view-mode .active").removeClass("active");
                var view = Shopify.queryParams.view;
                if (view.indexOf("list") >= 0) {
                    $(".view-mode .list").addClass("active");
                    //paging
                    view = view.replace("list", "");
                } else {
                    $(".view-mode .grid").addClass("active");
                }
                $(".filter-show > button span").text(view);
                $(".filter-show li.active").removeClass("active");
                $(".filter-show a[href='" + view + "']").parent().addClass("active");
            }
            occasion.initSortby();
        },
        initSortby: function() {
            //sort by filter
            if (Shopify.queryParams.sort_by) {
                var sortby = Shopify.queryParams.sort_by;
                var sortbyText = $(".filter-sortby span[data-href='" + sortby + "']").text();
                $(".filter-sortby > button span").text(sortbyText);
                $(".filter-sortby li.active").removeClass("active");
                $(".filter-sortby span[data-href='" + sortby + "']").parent().addClass("active");
            }
        },
        sidebarMapData: function(data) {
            var currentList = $(".col-main .products-grid");
            if (currentList.length == 0) {
                currentList = $(".col-main .product-list");
            }
            var productList = $(data).find(".col-main .products-grid");
            if (productList.length == 0) {
                productList = $(data).find(".col-main .product-list");
            }

            // set title html
          	$("title").text($(data).filter('title').text());
            currentList.replaceWith(productList);
            //convert currency
            if (occasion.checkNeedToConvertCurrency()) {
                Currency.convertAll(window.shop_currency, jQuery('.currencies').val(), '.col-main span.money', 'money_format');
            }

            //replace paging
            if ($(".padding").length > 0) {
                $(".padding").replaceWith($(data).find(".padding"));
            } else {
                $(".block-row.col-main .collections-content-product").append($(data).find(".padding"));
            }
          
            $(".collections-content-product .toolbar .page-total").replaceWith($(data).find(".collections-content-product .toolbar .page-total"));

            //replace title & description
            var currentHeader = $(".page-header");
            var dataHeader = $(data).find(".page-header");
            if (currentHeader.find("h1").text() != dataHeader.find("h1").text()) {
                currentHeader.find("h1").replaceWith(dataHeader.find("h1"));              
            }
                       
            $('.collection-description').replaceWith($(data).find('.collection-description'));
          
            //replace refined
            $(".refined-widgets").replaceWith($(data).find(".refined-widgets"));
            
            //replace tags
            $(".sidebar-block").replaceWith($(data).find(".sidebar-block"));
            // breadcrumb
            $(".breadcrumb .bd-title").replaceWith($(data).find(".breadcrumb .bd-title"));
          
            // replace blog
            $(".content-blog").replaceWith($(data).find(".content-blog"));
          
            occasion.initColorSwatchGrid();
          
            //product review
            if ($(".spr-badge").length > 0) {
                return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
            }
        },
        sidebarCreateUrl: function(baseLink) {
            var newQuery = $.param(Shopify.queryParams).replace(/%2B/g, '+');
            if (baseLink) {
                //location.href = baseLink + "?" + newQuery;
                if (newQuery != "")
                    return baseLink + "?" + newQuery;
                else
                    return baseLink;
            }
            return location.pathname + "?" + newQuery;
        },
        sidebarAjaxClick: function(baseLink) {
            delete Shopify.queryParams.page;
            var newurl = occasion.sidebarCreateUrl(baseLink);
            occasion.isSidebarAjaxClick = true;
            History.pushState({
                param: Shopify.queryParams
            }, newurl, newurl);
            occasion.sidebarGetContent(newurl);
        },
        sidebarGetContent: function(newurl) {
            $.ajax({
                type: 'get',
                url: newurl,
                beforeSend: function() {
                    occasion.showLoading();
                },
                success: function(data) {
                    occasion.sidebarMapData(data);
                    occasion.sidebarMapPaging();
                    occasion.translateBlock(".main-content");
                    occasion.sidebarMapTagEvents();
                    occasion.sidebarInitToggle();
                    occasion.sidebarMapClear();
                    occasion.sidebarMapClearAll();
                    occasion.ClearSelected();
                    occasion.hideLoading();
                    
                    occasion.initAddToCart();
                    occasion.initWishlist();
                    occasion.initInfiniteScrolling();
                  	occasion.InitProductTabs();
                    window.SPR.registerCallbacks();
                  	window.SPR.initRatingHandler();
                  	window.SPR.initDomEls();
                  	window.SPR.loadProducts();
                    window.SPR.loadBadges();
                },
                error: function(xhr, text) {
                    occasion.hideLoading();
                    $('.loading-modal').hide();
                    $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                    occasion.showModal('.ajax-error-modal');
                }
            });
        },
        sidebarParams: function() {
            Shopify.queryParams = {};
            //get after ?...=> Object {q: "Acme"} 
            if (location.search.length) {
                for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
                    aKeyValue = aCouples[i].split('=');
                    if (aKeyValue.length > 1) {
                        Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
                    }
                }
            }
        },
        initMobileSidebar: function() {
          $('.sidebar-mb a').on('click', function(){
            $('html').toggleClass('sidebar-open');

            $('.overlay-mn').on('click', function(){
              $('html').removeClass('sidebar-open');
            });
            
          });

        },
        initSidebar: function() {
            //if category page then init sidebar
            if ($(".collection-sidebar").length >= 0) {
                occasion.sidebarParams();
                occasion.initSortby();
                occasion.sidebarMapEvents();
                occasion.sidebarMapPaging();
                occasion.sidebarInitToggle();
                occasion.sidebarMapClear();
                occasion.sidebarMapClearAll();
                occasion.ClearSelected();
            }
        },
        initMobileMenu: function() {
//           $(".menu_mobile li .toogleClick").click(function(event) {
//               var toogleClick = $(this).parent();

//               if (toogleClick.hasClass("mobile-toggle-open")) {
//                 toogleClick.removeClass("mobile-toggle-open");
//               }

//               else {
//                 toogleClick.addClass("mobile-toggle-open");
//               }      

//               event.preventDefault();
//             });
                    
          $('.menu-mobile ul').html($('.nav-left .main-menu ul').html());
          
          $('.mn-mobile ul').html($('.nav-middle .site-nav').html()); 
          
          $('.hd-mobile .cat-icon').on('click',function(){
            $('html').toggleClass('menu-open');
            
            $('.closemn, .overlay-mn').on('click', function(){            
              $('html').removeClass('menu-open');            
            });
          });
          
          $('.nav-mobile .icon-option').on('click',function(){
            $('html').toggleClass('mn-open');

            $('.closemn, .overlay-mn').on('click', function(){            
              $('html').removeClass('mn-open');            
            });
          });      
          
          $('.menu-mobile .icon, .nav-mobile .icon').on('click', function(e){
            e.preventDefault();
            if($(this).hasClass('mobile-toggle-open')) {
              $(this).parent().next().slideUp(200);
              $(this).removeClass("mobile-toggle-open");
            }
            else{
              $(this).parent().next().slideDown(200);
              $(this).addClass("mobile-toggle-open");
            }
          });

          $('.cart-mobile .cart-icon').on('click', function(e){   
            $('.cart-mobile .dropdown-cart').slideToggle(200);          
          });
          
          $('.hd-mobile .search-icon').on('click',function(){
            $('.hd-mobile .search-form').slideToggle(200); 
          });
        },
        initWishlist: function() {
          $(document).on('click', '.wishlist-btn:not(.is-active)', function(e) {
            e.preventDefault();
            var form = $(this).parent();
            var item = form.parents('.product-item');
              occasion.showLoading();
            setTimeout(function(){
              occasion.hideLoading();
              if($('body').hasClass('template-product')){
                var title = $('.product-title h1').html();
                var image = $('.slick-current .product-featured-image').attr('src');
                $('.ajax-success-modal').find('.ajax-product-title').html(title);
                $('.ajax-success-modal').find('.ajax-product-image').attr('src', image);
              }
              else{
                var title = item.find('.product-title').html();
                var image = item.find('a > img').attr('src');
                $('.ajax-success-modal').find('.ajax-product-title').html(title);
                $('.ajax-success-modal').find('.ajax-product-image').attr('src', image);
              }
              $('.ajax-success-modal').find('.btn-go-to-wishlist').show();
              $('.ajax-success-modal').find('.btn-go-to-cart').hide();
              occasion.showModal('.ajax-success-modal');
            },500);
          });
        },
        initProductWishlist: function() {
//           $(document).on('click', '.wishlist-btn:not(.is-active)', function(e) {
//             e.preventDefault();
//             var form = $(this).parent();
//                 var item = form.parents('.grid-item');
//             occasion.showLoading();
//             setTimeout(function(){
//               occasion.hideLoading();
//               var title = $('.product-title h1').html();
//               var image = $('.slick-curren .product-featured-image').attr('src');
//               $('.ajax-success-modal').find('.ajax-product-title').html(title);
//               $('.ajax-success-modal').find('.ajax-product-image').attr('src', image);
//               $('.ajax-success-modal').find('.btn-go-to-wishlist').show();
//               $('.ajax-success-modal').find('.btn-go-to-cart').hide();
//               occasion.showModal('.ajax-success-modal');
//             },500);
//           });
        },
        initRemoveWishlist: function() {
            $('.btn-remove-wishlist').click(function(e) {
                var row = $(this).parents('tr');
                var tagID = row.find('.tag-id').val();
                var form = jQuery('#remove-wishlist-form');
                form.find("input[name='contact[tags]']").val('x' + tagID);
                $.ajax({
                    type: 'POST',
                    url: '/contact',
                    data: form.serialize(),
                    beforeSend: function() {
                        occasion.showLoading();
                    },
                    success: function(data) {
                        occasion.hideLoading();
                        row.fadeOut(1000);
                    },
                    error: function(xhr, text) {
                        occasion.hideLoading();
                        $('.loading-modal').hide();
                        $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                        occasion.showModal('.ajax-error-modal');
                    }
                });
            });
        },
        initColorSwatchGrid: function() { 
          jQuery('.item-swatch li label').on('click',function(){
            $(".item-swatch li label").removeClass("active");
            $(this).addClass("active");
            var newImage = jQuery(this).data('img');
            jQuery(this).parents('.grid-item').find('.product-image img').attr({ src: newImage }); 
            return false;
          });
          
          jQuery('.product-tab-bottom .column-left .item-swatch li label').on('click',function(){
            var dataColor = $(this).data('variant');
            var newImage = jQuery(this).data('img');
            jQuery(this).parents('.product-item').find('.product-image .slick-current img').attr({ src: newImage }); 
            jQuery('.product-tab-bottom .column-left .product-content .variantID').val(dataColor);
          });
        },

        initInfiniteScrolling: function() {
            if ($('.infinite-scrolling').length > 0) {
                $('.infinite-scrolling a').click(function(e) {
                    e.preventDefault();
                    if (!$(this).hasClass('disabled')) {
                        occasion.doInfiniteScrolling();
                    }
                });
            }
        },
        doInfiniteScrolling: function() {
            var currentList = $('.block-row .products-grid');
            if (!currentList.length) {
                currentList = $('.block-row .product-list');
            }
            if (currentList) {
                var showMoreButton = $('.infinite-scrolling a').first();
                $.ajax({
                    type: 'GET',
                    url: showMoreButton.attr("href"),
                    beforeSend: function() {
                        occasion.showLoading();
                        $('.loading-modal').show();
                    },
                    success: function(data) {
                        occasion.hideLoading();
                        var products = $(data).find(".block-row .products-grid");
                        if (!products.length) {
                            products = $(data).find(".block-row .product-list");
                        }
                        if (products.length) {

                            currentList.append(products.children());
                            occasion.translateBlock("." + currentList.attr("class"));
                          	occasion.translateBlock(".main-content");
                            occasion.initAddToCart();
                            occasion.initWishlist();
                            //get link of Show more
                            if ($(data).find('.infinite-scrolling').length > 0) {
                                showMoreButton.attr('href', $(data).find('.infinite-scrolling a').attr('href'));
                            } else {
                                //no more products
                                showMoreButton.hide();
                                showMoreButton.next().show();
                            }
                          
                          	//currency
                            if (window.show_multiple_currencies && window.shop_currency != jQuery(".currencies").val())
                            {
                                Currency.convertAll(window.shop_currency, jQuery(".currencies").val(), "span.money", "money_format")
                            }
                          
                            occasion.initColorSwatchGrid();
                          
                            //product review
                            if ($(".spr-badge").length > 0) {
                                return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                            }
                        }
                    },
                    error: function(xhr, text) {
                        occasion.hideLoading();
                        $('.loading-modal').hide();
                        $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                        occasion.showModal('.ajax-error-modal');
                    },
                    dataType: "html"
                });
            }
        },
        closeEmailModalWindow: function() {
            if ($('#email-modal').length > 0 && $('#email-modal').is(':visible')) {
                $('#email-modal .modal-window').fadeOut(600, function() {
                    $('#email-modal .modal-overlay').fadeOut(600, function() {
                        $('#email-modal').hide();
                        $.cookie('emailSubcribeModal', 'closed', {
                            expires: 1,
                            path: '/'
                        });
                    });
                });
            }
        },
        showModal: function(selector) {
            $(selector).fadeIn(500)
            occasion.occasionTimeout = setTimeout(function() {
                $(selector).fadeOut(500);
            }, 5000);
        },
        initToggleCollectionPanel: function() {
            if ($('.collection-sharing-btn').length > 0) {
                $('.collection-sharing-btn').click(function() {
                    $('.collection-sharing-panel').toggle();
                    if ($('.collection-sharing-panel').is(':visible')) {
                        $('.collection-sharing-btn').addClass('btn-hover');
                        $('.collection-filter-panel').hide();
                        $('.collection-filter-btn').removeClass('btn-hover');
                    } else {
                        $('.collection-sharing-btn').removeClass('btn-hover');
                    }
                });
            }
            if ($('.collection-filter-btn').length > 0) {
                $('.collection-filter-btn').click(function() {
                    $('.collection-filter-panel').toggle();
                    if ($('.collection-filter-panel').is(':visible')) {
                        $('.collection-filter-btn').addClass('btn-hover');
                        $('.collection-sharing-panel').hide();
                        $('.collection-sharing-btn').removeClass('btn-hover');
                    } else {
                        $('.collection-filter-btn').removeClass('btn-hover');
                    }
                });
                $('.collection-filter-panel select').change(function(index) {
                    window.location = $(this).find('option:selected').val();
                });
            }
        },
        checkItemsInDropdownCart: function() {
            if ($('.dropdown-cart .mini-products-list').children().length > 0) {
                //Has item in dropdown cart
                $('.dropdown-cart .no-items').hide();
                $('.dropdown-cart .has-items').show();
            } else {
                //No item in dropdown cart                
                $('.dropdown-cart .has-items').hide();
                $('.dropdown-cart .no-items').show();
            }
        },
        initModal: function() {
            $('.continue-shopping').click(function() {
                clearTimeout(occasion.occasionTimeout);
                $('.ajax-success-modal').fadeOut(500);
            });
            $('.close-modal, .overlay').click(function() {
                clearTimeout(occasion.occasionTimeout);
                $('.ajax-success-modal').fadeOut(500);
            });
        },	
        initDropDownCart: function() {
          $('.top-cart').click(function(e) {
            e.stopPropagation();
            $('.dropdown-cart').slideToggle('fast');

          });

          occasion.checkItemsInDropdownCart();

          $('.dropdown-cart .no-items a').click(function(e) {
            $(".dropdown-cart").slideUp('fast');
          });

          $('.dropdown-cart .btn-remove').click(function(event) {
            event.preventDefault();
            var productId = $(this).parents('.item').attr('id');
            productId = productId.match(/\d+/g);
            Shopify.removeItem(productId, function(cart) {
              occasion.doUpdateDropdownCart(cart);
            });
          });
        },
        closeDropdownCart: function() {
          if ($('.bottom-header .dropdown-cart').is(':visible')) {
            $(".bottom-header .dropdown-cart").slideUp('fast');
          }
        },
        initDropdownSearch: function() {
            $('.nav-search .icon-search').click(function() {
                if ($('.header-bottom.on .search-bar').is(':visible')) {
                    $('.header-bottom.on .search-bar').slideUp('fast');
                } else {
                    $('.header-bottom.on .search-bar').slideDown('fast');
                }
            });
        },
        closeDropdownSearch: function() {
            if ($(".header-bottom.on .search-bar").is(":visible")) {
                $(".header-bottom.on .search-bar").slideUp("fast")
            }
        },
      
        initCloudzoom: function() {
          if ($(".product-featured-image").length > 0) {
          }

        },
      
        initScrollTop: function() {
            $('#back-top').click(function() {
                $('body,html').animate({
                    scrollTop: 0
                }, 400);
                return false;
            });
        },
        initProductAddToCart: function() {
            if ($('#product-add-to-cart').length > 0) {
                $('#product-add-to-cart').click(function(event) {
                    event.preventDefault();
                    if ($(this).attr('disabled') != 'disabled') {
                        if (!window.ajax_cart) {
                            $(this).closest('form').submit();
                        } else {
                            var variant_id = $('#add-to-cart-form select[name=id]').val();
                            if (!variant_id) {
                                variant_id = $('#add-to-cart-form input[name=id]').val();
                            }
                            var quantity = $('#add-to-cart-form input[name=quantity]').val();
                            if (!quantity) {
                                quantity = 1;
                            }
                            var title = $('.product-title h1').html();
                            var image = $('.slick-current .product-featured-image').attr('src');
                            occasion.doAjaxAddToCart(variant_id, quantity, title, image);
                        }
                    }
                    return false;
                });
            }
        },
        initAddToCart: function() {
            if ($('.add-to-cart-btn').length > 0) {
                $('.add-to-cart-btn').click(function(event) {
                    event.preventDefault();
                    if ($(this).attr('disabled') != 'disabled') {
                        var productItem = $(this).parents('.product-item');
                        var productId = $(productItem).attr('id');
                        productId = productId.match(/\d+/g);
                        if (!window.ajax_cart) {
                            $('#product-actions-' + productId).submit();
                        } else {
                            var variant_id = $('#product-actions-' + productId + ' select[name=id]').val();
                            if (!variant_id) {
                                variant_id = $('#product-actions-' + productId + ' input[name=id]').val();
                            }
                            var quantity = $('#product-actions-' + productId + ' input[name=quantity]').val();
                            if (!quantity) {
                                quantity = 1;
                            }
                            var title = $(productItem).find('.product-title').html();
                            var image = $(productItem).find('.product-image img').attr('src');
                            occasion.doAjaxAddToCart(variant_id, quantity, title, image);
                        }
                    }
                    return false;
                });
            }
        },
        showLoading: function() {
            $('.loading-modal').show();
        },
        hideLoading: function() {
            $('.loading-modal').hide();
        },
        doAjaxAddToCart: function(variant_id, quantity, title, image) {
            $.ajax({
                type: "post",
                url: "/cart/add.js",
                data: 'quantity=' + quantity + '&id=' + variant_id,
                dataType: 'json',
                beforeSend: function() {
                    occasion.showLoading();
                },
                success: function(msg) {
                    occasion.hideLoading();
                    $('.ajax-success-modal').find('.ajax-product-title').html(occasion.translateText(title));
                    $('.ajax-success-modal').find('.ajax-product-image').attr('src', image);
                    $('.ajax-success-modal').find('.btn-go-to-wishlist').hide();
                    $('.ajax-success-modal').find('.btn-go-to-cart').show();

                    occasion.showModal('.ajax-success-modal');
                    occasion.updateDropdownCart();
                },
                error: function(xhr, text) {
                    occasion.hideLoading();
                    $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                    occasion.showModal('.ajax-error-modal');
                }
            });
        },
        initQuickView: function() {
          $('.quickview-button a').click(function() {
            var product_handle = $(this).attr('id');
            Shopify.getProduct(product_handle, function(product) {
              var template = $('#quickview-template').html();
              $('.quick-view').html(template);
              var quickview = $('.quick-view');

              quickview.find('.product-title a').html(occasion.translateText(product.title));
              quickview.find('.product-title a').attr('href', product.url);
              if (quickview.find('.product-vendor span').length > 0) {
                quickview.find('.product-vendor span').text(product.vendor);
              }
              if (quickview.find('.product-type span').length > 0) {
                quickview.find('.product-type span').text(product.type);
              }
              if (quickview.find('.product-inventory span').length > 0) {
                var variant = product.variants[0];
                var inventoryInfo = quickview.find('.product-inventory span');                      
                if (variant.available) {
                  if (variant.inventory_management!=null) {
                    inventoryInfo.text(window.inventory_text.in_stock);
                  } else {
                    inventoryInfo.text(window.inventory_text.many_in_stock);
                  }
                } else {
                  inventoryInfo.text(window.inventory_text.out_of_stock);
                }
              }
              //countdown for quickview
              if (product.description.indexOf("[countdown]") > 0) {
                var countdownTime = product.description.match(/\[countdown\](.*)\[\/countdown\]/);
                if (countdownTime && countdownTime.length > 0) {
                  quickview.find(".countdown").show();
                  quickview.find(".quickview-clock").countdown(countdownTime[1], function(event) {
                    $(this).html(event.strftime('%Dd %H:%M:%S'));
                  });
                }
              }
              if (quickview.find('.product-description').length > 0) {
                var description = product.description.replace(/(<([^>]+)>)/ig, "");
                var description = description.replace(/\[countdown\](.*)\[\/countdown\]/g, "");
                if (window.multi_lang) {
                  if (description.indexOf("[lang2]") > 0) {
                    var descList = description.split("[lang2]");
                    if (jQuery.cookie("language") != null) {
                      description = descList[translator.current_lang - 1];
                    } else {
                      description = descList[0];
                    }
                  }
                }
                description = description.split(" ").splice(0, 20).join(" ") + "...";
                quickview.find('.product-description').text(description);
              } else {
                quickview.find('.product-description').remove();
              }

              quickview.find('.price').html(Shopify.formatMoney(product.price, window.money_format));
              quickview.find('.product-item').attr('id', 'product-' + product.id);
              quickview.find('.variants').attr('id', 'product-actions-' + product.id);
              quickview.find('.variants select').attr('id', 'product-select-' + product.id);

              //if has compare price
              if (product.compare_at_price > product.price) {
                quickview.find('.compare-price').html(Shopify.formatMoney(product.compare_at_price_max, window.money_format)).show();
                quickview.find('.price').addClass('on-sale');
              } else {
                quickview.find('.compare-price').html('');
                quickview.find('.price').removeClass('on-sale');
              }

                    //out of stock
                    if (!product.available) {
                        quickview.find("select, input, .total-price, .dec, .inc, .variants label").remove();
                        quickview.find(".add-to-cart-btn").text(window.inventory_text.unavailable).addClass('disabled').attr("disabled", "disabled");;
                    } else {
                        quickview.find('.total-price span').html(Shopify.formatMoney(product.price, window.money_format));
                        if (window.use_color_swatch) {
                            occasion.createQuickViewVariantsSwatch(product, quickview);
                        } else {
                            occasion.createQuickViewVariants(product, quickview);
                        }
                    }

                    //quantity
                    quickview.find(".button").on("click", function() {
                        var oldValue = quickview.find(".quantity").val(),
                            newVal = 1;
                        if ($(this).text() == "+") {
                            newVal = parseInt(oldValue) + 1;
                        } else if (oldValue > 1) {
                            newVal = parseInt(oldValue) - 1;
                        }
                        quickview.find(".quantity").val(newVal);

                        if (quickview.find(".total-price").length > 0) {
                            occasion.updatePricingQuickview();
                        }
                    });

                    if (window.show_multiple_currencies) {
                        Currency.convertAll(window.shop_currency, jQuery('.currencies').val(), 'span.money', 'money_format');
                    }

                    occasion.loadQuickViewSlider(product, quickview);
                    occasion.initQuickviewAddToCart();
                    occasion.translateBlock(".quick-view");                    

                    $('.quick-view').fadeIn(500);
                    if ($('.quick-view .total-price').length > 0) {
                        $('.quick-view input[name=quantity]').on('change', occasion.updatePricingQuickview);
                    }
                });

                return false;
            });

            $(document).on("click", ".quick-view .overlay, .close-window", function() {
                occasion.closeQuickViewPopup();
                return false;
            });
        },
        updatePricingQuickview: function() {
            //try pattern one before pattern 2
            var regex = /([0-9]+[.|,][0-9]+[.|,][0-9]+)/g;
            var unitPriceTextMatch = $('.quick-view .price').text().match(regex);

            if (!unitPriceTextMatch) {
                regex = /([0-9]+[.|,][0-9]+)/g;
                unitPriceTextMatch = $('.quick-view .price').text().match(regex);
            }

            if (unitPriceTextMatch) {
                var unitPriceText = unitPriceTextMatch[0];
                var unitPrice = unitPriceText.replace(/[.|,]/g, '');
                var quantity = parseInt($('.quick-view input[name=quantity]').val());
                var totalPrice = unitPrice * quantity;

                var totalPriceText = Shopify.formatMoney(totalPrice, window.money_format);
                regex = /([0-9]+[.|,][0-9]+[.|,][0-9]+)/g;     
                if (!totalPriceText.match(regex)) {
                   regex = /([0-9]+[.|,][0-9]+)/g;
                } 
                totalPriceText = totalPriceText.match(regex)[0];

                var regInput = new RegExp(unitPriceText, "g");
                var totalPriceHtml = $('.quick-view .price').html().replace(regInput, totalPriceText);

                $('.quick-view .total-price span').html(totalPriceHtml);
            }
        },
        initQuickviewAddToCart: function() {
            if ($('.quick-view .add-to-cart-btn').length > 0) {
                $('.quick-view .add-to-cart-btn').click(function() {
                    var variant_id = $('.quick-view select[name=id]').val();
                    if (!variant_id) {
                        variant_id = $('.quick-view input[name=id]').val();
                    }
                    var quantity = $('.quick-view input[name=quantity]').val();
                    if (!quantity) {
                        quantity = 1;
                    }

                    var title = $('.quick-view .product-title a').html();
                    var image = $('.quick-view .quickview-featured-image img').attr('src');
                    occasion.doAjaxAddToCart(variant_id, quantity, title, image);
                    occasion.closeQuickViewPopup();
                });
            }
        },
        updateDropdownCart: function() {
            Shopify.getCart(function(cart) {
                occasion.doUpdateDropdownCart(cart);
            });
        },
        doUpdateDropdownCart: function(cart) {
            var template = '<li class="item" id="cart-item-{ID}"><a href="{URL}" title="{TITLE}" class="product-image"><img src="{IMAGE}" alt="{TITLE}"></a><div class="product-details"><a href="javascript:void(0)" title="Remove This Item" class="btn-remove"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 14 17"><defs><path id="8dsha" d="M653.13 578.17c0-.14.12-.26.26-.26.15 0 .26.12.26.26v10.2c0 .44-.18.85-.47 1.15-.3.3-.7.48-1.14.48h-8.08c-.45 0-.85-.18-1.14-.48-.3-.3-.47-.7-.47-1.16v-10.19c0-.14.11-.26.26-.26.14 0 .26.12.26.26v10.2c0 .3.12.57.32.77.2.2.47.33.77.33h8.08a1.11 1.11 0 0 0 1.09-1.1v-10.2zm-7.08 9.5c0 .15-.11.27-.26.27a.26.26 0 0 1-.26-.26v-9.44c0-.15.12-.27.26-.27.15 0 .26.12.26.27zm2.21 0c0 .15-.12.27-.26.27a.26.26 0 0 1-.26-.26v-9.44c0-.15.12-.27.26-.27s.26.12.26.27zm2.2 0c0 .15-.1.27-.25.27a.26.26 0 0 1-.26-.26v-9.44c0-.15.11-.27.26-.27.14 0 .26.12.26.27zm-4.56-13.03c0 .14-.11.26-.26.26a.26.26 0 0 1-.26-.26c0-.45.18-.86.47-1.16.3-.3.7-.48 1.14-.48H649c.44 0 .85.18 1.14.48.29.3.47.7.47 1.16 0 .14-.12.26-.26.26a.26.26 0 0 1-.26-.26c0-.3-.13-.58-.32-.78-.2-.2-.47-.33-.77-.33H647a1.11 1.11 0 0 0-1.09 1.1zm8.17.76c.25 0 .48.1.65.28.18.17.28.41.28.67v.69c0 .15-.12.27-.26.27h-13.48a.26.26 0 0 1-.26-.27v-.69c0-.26.1-.5.27-.67.18-.17.4-.28.66-.28zm0 .53h-12.14a.4.4 0 0 0-.29.13.42.42 0 0 0-.12.3v.41h12.96v-.42a.42.42 0 0 0-.12-.3.4.4 0 0 0-.3-.12z"></path></defs><g><g transform="translate(-641 -573)"><use xlink:href="#8dsha"></use></g></g></svg></a><p class="product-name"><a href="{URL}">{TITLE}</a></p><div class="cart-collateral"><span class="qlty">{QUANTITY} x </span> <span class="price">{PRICE}</span></div></div></li>';

            $('.cart-count').text(cart.item_count);
            /*Total price*/
            $('.dropdown-cart .summary .price').html(Shopify.formatMoney(cart.total_price, window.money_format));
          	$('.my-cart .all-price').html(Shopify.formatMoney(cart.total_price, window.money_format));
            /*Clear cart*/
            $('.dropdown-cart .mini-products-list').html('');
            /*Add product to cart*/
            if (cart.item_count > 0) {
                for (var i = 0; i < cart.items.length; i++) {
                    var item = template;
                    item = item.replace(/\{ID\}/g, cart.items[i].id);
                    item = item.replace(/\{URL\}/g, cart.items[i].url);
                    item = item.replace(/\{TITLE\}/g, occasion.translateText(cart.items[i].title));
                    item = item.replace(/\{QUANTITY\}/g, cart.items[i].quantity);
                    item = item.replace(/\{IMAGE\}/g, Shopify.resizeImage(cart.items[i].image, 'grande'));
                    item = item.replace(/\{PRICE\}/g, Shopify.formatMoney(cart.items[i].price, window.money_format));
                    $('.dropdown-cart .mini-products-list').append(item);
                }
                $('.dropdown-cart .btn-remove').click(function(event) {
                    event.preventDefault();
                    var productId = $(this).parents('.item').attr('id');
                    productId = productId.match(/\d+/g);
                    Shopify.removeItem(productId, function(cart) {
                        occasion.doUpdateDropdownCart(cart);
                    });
                });
                if (occasion.checkNeedToConvertCurrency()) {
                    Currency.convertAll(window.shop_currency, jQuery('.currencies').val(), '.dropdown-cart span.money', 'money_format');
                }
            }
            occasion.checkItemsInDropdownCart();
        },
        checkNeedToConvertCurrency: function() {
            return window.show_multiple_currencies && Currency.currentCurrency != shopCurrency;
        },
        loadQuickViewSlider: function(product, quickviewTemplate) {
          var product_slide_1 = quickviewTemplate.find('.quickview-featured-image');
          var count = 0;
          for (i in product.images) {
            if (count < product.images.length) {
              var featuredImage = Shopify.resizeImage(product.images[i], 'grande');

              var item = '<div class="qv_item"><a href="' + product.url + '"><img src="' + featuredImage + '" title="' + product.title + '" /></a></div>'

              product_slide_1.append(item);
              count = count + 1;
            }
          }
          
          var product_slide_2 = quickviewTemplate.find('.more-view-wrapper ul');
          var count = 0;
          for (i in product.images) {
            if (count < product.images.length) {
              var grande = Shopify.resizeImage(product.images[i], 'grande');
              var compact = Shopify.resizeImage(product.images[i], 'compact');
              var item = '<li class="grid-item"><a href="javascript:void(0)" data-image="' + grande + '"><img src="' + compact + '"  /></a></li>'

              product_slide_2.append(item);
              count = count + 1;
            }
          }
          setTimeout(function() {
          	occasion.initQuickViewCarousel(product_slide_1, product_slide_2);
          }, 500);
          

        },
        initQuickViewCarousel: function(product_slide_1, product_slide_2) {
          product_slide_1.not('.slick-initialized').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: product_slide_2
          });

          product_slide_2.not('.slick-initialized').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            asNavFor: product_slide_1,
            dots: false,
            focusOnSelect: true,
            verticalSwiping: true,
            vertical: $('.product-photo-container').data('moreview'),
            arrows: true,
            nextArrow: '<button type="button" class="slick-next"><?xml version="1.0" encoding="iso-8859-1"?><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 477.175 477.175" style="enable-background:new 0 0 477.175 477.175;" xml:space="preserve"><g><path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg></button>',
            prevArrow: '<button type="button" class="slick-prev"><?xml version="1.0" encoding="iso-8859-1"?><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 477.175 477.175" style="enable-background:new 0 0 477.175 477.175;" xml:space="preserve"><g><path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225 c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z"/></g></svg></button>'
          });
        },
        convertToSlug: function(text) {
            return text
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        },
        createQuickViewVariantsSwatch: function(product, quickviewTemplate) {
            if (product.variants.length > 1) { //multiple variants
                for (var i = 0; i < product.variants.length; i++) {
                    var variant = product.variants[i];
                    var option = '<option value="' + variant.id + '">' + variant.title + '</option>';
                    quickviewTemplate.find('form.variants > select').append(option);
                }
                new Shopify.OptionSelectors("product-select-" + product.id, {
                    product: product,
                    onVariantSelected: selectCallbackQuickview
                });

                //start of quickview variant;
               var filePath = window.file_url.substring(0, window.file_url.lastIndexOf('?'));
                var assetUrl = window.asset_url.substring(0, window.asset_url.lastIndexOf('?'));
                var options = "";
                for (var i = 0; i < product.options.length; i++) {
                  if (/Color|Colour|size/i.test(product.options[i].name)) {
                    options += '<div class="swatch clearfix" data-option-index="' + i + '">';
                    options += '<div class="header">' + product.options[i].name + '<em>*</em></div>';
                    var is_color = false;
                    if (/Color|Colour/i.test(product.options[i].name)) {
                        is_color = true;
                    }
                    var optionValues = new Array();
                    for (var j = 0; j < product.variants.length; j++) {
                        var variant = product.variants[j];
                        var value = variant.options[i];
                        var valueHandle = this.convertToSlug(value);
                        var forText = 'swatch-' + i + '-' + valueHandle;
                        if (optionValues.indexOf(value) < 0) {
                            //not yet inserted
                            options += '<div data-value="' + value + '" class="swatch-element ' + (is_color ? "color " : "") + valueHandle + (variant.available ? ' available ' : ' soldout ') + '">';

                            options += '<input id="' + forText + '" type="radio" name="option-' + i + '" value="' + value + '" ' + (j == 0 ? ' checked ' : '') + (variant.available ? '' : ' disabled') + ' />';

                            if (is_color) {
                                options += '<label for="' + forText + '" style="background-color: ' + valueHandle + '; background-image: url(' + filePath + valueHandle + '.png)"><img class="crossed-out" src="' + assetUrl + 'soldout.png" /></label>';
                            } else {
                                options += '<label for="' + forText + '">' + value + '<img class="crossed-out" src="' + assetUrl + 'soldout.png" /></label>';
                            }
                            options += '</div>';
                            if (variant.available) {
                                $('.quick-view .swatch[data-option-index="' + i + '"] .' + valueHandle).removeClass('soldout').addClass('available').find(':radio').removeAttr('disabled');
                            }
                            optionValues.push(value);
                        }
                    }
                    options += '</div>';
                  } else {
                    quickviewTemplate.find('.selector-wrapper').show();
                    quickviewTemplate.find('form.variants .selector-wrapper label').each(function(i, v) {
                      $(this).html(product.options[i].name + '<em>*</em>');
                      quickviewTemplate.find('.selector-wrapper label:contains(Color)').parent().hide();
                      quickviewTemplate.find('.selector-wrapper label:contains(Size)').parent().hide();
                    });
                    if (product.options.length == 1) {
                      quickviewTemplate.find('.selector-wrapper:eq(0)').prepend('<label>' + product.options[0].name + '<em>*</em></label>');
                      for (var text = product.variants, r = 0; r < text.length; r++ ) {
                        var s = text[r];
                        if (!s.available) {
                          jQuery('.single-option-selector option').filter(function() { return jQuery(this).html() === s.title }).remove();
                        }
                      };
                    }
                  }
                }
                quickviewTemplate.find('form.variants .selector-wrapper:eq(0)').before(options);
                quickviewTemplate.find('.swatch :radio').change(function() {
                    var optionIndex = $(this).closest('.swatch').attr('data-option-index');
                    var optionValue = $(this).val();
                    $(this)
                        .closest('form')
                        .find('.single-option-selector')
                        .eq(optionIndex)
                        .val(optionValue)
                        .trigger('change');
                });
                if (product.available) {
                    Shopify.optionsMap = {};
                    Shopify.linkOptionSelectors(product);
                }

                //end of quickview variant
            } else { //single variant
                quickviewTemplate.find('form.variants > select').remove();
                var variant_field = '<input type="hidden" name="id" value="' + product.variants[0].id + '">';
                quickviewTemplate.find('form.variants').append(variant_field);
            }
        },
        createQuickViewVariants: function(product, quickviewTemplate) {
            if (product.variants.length > 1) { //multiple variants
                for (var i = 0; i < product.variants.length; i++) {
                    var variant = product.variants[i];
                    var option = '<option value="' + variant.id + '">' + variant.title + '</option>';
                    quickviewTemplate.find('form.variants > select').append(option);
                }

                new Shopify.OptionSelectors("product-select-" + product.id, {
                    product: product,
                    onVariantSelected: selectCallbackQuickview
                });

                if (product.options.length == 1) {
                    $('.selector-wrapper:eq(0)').prepend('<label>' + product.options[0].name + '</label>');
                    for (var text = product.variants, r = 0; r < text.length; r++ ) {
                      var s = text[r];
                      if (!s.available) {
                        jQuery('.single-option-selector option').filter(function() { return jQuery(this).html() === s.title }).remove();
                      }
                    };
                }
              
//                 $('.quick-view .single-option-selector').selectize();
//                 $('.quick-view .selectize-input input').attr("disabled", "disabled");
              
                quickviewTemplate.find('form.variants .selector-wrapper label').each(function(i, v) {
                    $(this).html(product.options[i].name);
                });
            } else { //single variant
                quickviewTemplate.find('form.variants > select').remove();
                var variant_field = '<input type="hidden" name="id" value="' + product.variants[0].id + '">';
                quickviewTemplate.find('form.variants').append(variant_field);
            }

        },
        closeQuickViewPopup: function() {
            $('.quick-view').fadeOut(500);
        },
        translateText: function(str) {
          if (!window.multi_lang || str.indexOf("|") < 0)
            return str;

          if (window.multi_lang) {
            var textArr = str.split("|");
            if (translator.isLang2())
              return textArr[1];
            return textArr[0];
          }          
        },
        translateBlock: function(blockSelector) {
          if (window.multi_lang && translator.isLang2()) {
            translator.doTranslate(blockSelector);
          }
        },
        doAjaxProductTabs:function(href, data1, row1, row2){
          $.ajax({
            url: href,
            type:'GET',
            success: function(data){
              if(href == '/collections/?view=json'){
                $('.home-product-tab .loading').text('Please link to collections');
              }
              
              data1.html($(data).find('.grid-items').html());
              
              data1.not('.slick-initialized').slick({
                slidesPerRow: row1,
                rows: row2,
                speed: 900,
                arrows: true,
                nextArrow: '<button type="button" class="slick-next">Next</button>',
                prevArrow: '<button type="button" class="slick-prev">Prev</button>'
              });
              
              occasion.translateBlock(data1);
              occasion.initQuickView();
              occasion.initAddToCart();
              occasion.initWishlist();
            },
            error: function (msg) {
              $('.home-product-tab .loading').text('Please link to collections');
            },
          });
        },
        doAjaxProductTabs3:function(href, data1, row1, row2){
          $.ajax({
            url: href,
            type:'GET',
            success: function(data){
              if(href == '/collections/?view=json'){
                $('.home-product-tab .loading').text('Please link to collections');
              }
              data1.html($(data).find('.grid-items').html());

              data1.not('.slick-initialized').slick({
                slidesPerRow: row1,
                rows: row2,
                speed: 900,
                arrows: true,
                nextArrow: '<button type="button" class="slick-next">Next</button>',
                prevArrow: '<button type="button" class="slick-prev">Prev</button>',
                responsive: [
                  {
                    breakpoint: 1024,

                    settings: {
                      slidesPerRow: 2,
                      rows: row2,   
                      dots: true,
                      arrows: false   
                    }
                  },
                  {
                    breakpoint: 768,

                    settings: {
                      slidesPerRow: 2,
                      rows: row2,
                      dots: true,
                      arrows: false
                    }
                  },
                  {
                    breakpoint: 480,

                    settings: {
                      slidesPerRow: 2,
                      rows: row2,
                      dots: true,
                      arrows: false
                    }
                  }
                ]
              });

              /*//product review
              if ($(".spr-badge").length > 0) {
                window.SPR.registerCallbacks();
                window.SPR.initRatingHandler();
                window.SPR.initDomEls();
                window.SPR.loadProducts();
                window.SPR.loadBadges();
              }*/
              occasion.translateBlock(data1);
              occasion.initQuickView();
              occasion.initAddToCart();
              occasion.initWishlist();
            },
            error: function (msg) {
              $('.home-product-tab .loading').text('Please link to collections');
            },
            complete: function () {
              //product review
              if ($(".spr-badge").length > 0) {
                window.SPR.registerCallbacks();
                window.SPR.initRatingHandler();
                window.SPR.initDomEls();
                window.SPR.loadProducts();
                window.SPR.loadBadges();
              }                
            },
          });
        },
        doAjaxProductTabs2:function(href, data1, limit, row){
          $.ajax({
            url: href,
            type:'GET',
            success: function(data){
              if(href == '/collections/?view=json2'){
                $('.product-tab-bottom .loading').text('Please link to collections');
              }
              data1.html($(data).find('.grid-items').html());
              data1.find($('.pr-gird')).slice(limit).remove();
              data1.find($('.pr-gird')).addClass(''+row+'');
              occasion.translateBlock(data1);
              occasion.initQuickView();
              occasion.initAddToCart();
              occasion.initWishlist();
            },
            error: function (msg) {
              $('.product-tab-bottom .loading').text('Please link to collections');
            },
          });
        },
        InitProductTabs: function(){
          var href = $('.home-product-tab .pro-top-rated').data('url');
          var data1 = $('.home-product-tab .pro-top-rated .product-grids');
          var row1 = $('.home-product-tab .pro-top-rated').data('row1');
          var row2 = $('.home-product-tab .pro-top-rated').data('row2');
          occasion.doAjaxProductTabs(href, data1, row1, row2);
        },
        InitProductTabs2: function(){
          /*var href =   $('.home-product-tab .module-product').find('.active').data('href');
          var tabsID = $('.home-product-tab .column-right .tab-pane').data('id');
          var data1 = $(tabsID).find('.product-grids');
          var row1 = $(tabsID).data('row1');
          var row2 = $(tabsID).data('row2');
          occasion.doAjaxProductTabs3(href, data1, row1, row2);*/
          // fix from toni
          $('.home-product-tab .module-product').each(function(){
            var href =   $(this).find('li a.active').data('href');
            var tabsID = $(this).find('.tab-content .tab-pane').data('id');
            var data1 = $(tabsID).find('.product-grids');
            var row1 = $(tabsID).data('row1');
            var row2 = $(tabsID).data('row2');
            occasion.doAjaxProductTabs3(href, data1, row1, row2);
          })
        },
        InitProductTabs3: function(){
          $('.home-product-tab .nav-tabs li a:not(.first)').one('click',function(e){
            var href =  $(this).data('href');
            var id =  $(this).data('id');
            var data1 = $('#tab-product-'+ id + '').find('.product-grids');
            var row1 = $('#tab-product-'+ id + '').data('row1');
            var row2 = $('#tab-product-'+ id + '').data('row2');
            occasion.doAjaxProductTabs3(href, data1, row1, row2);
          })
        },

        InitProductTabsBottom: function(){ 
          var href =   $('.product-tab-bottom .nav-tabs').find('.active').data('href');
          var tabsID = $('.product-tab-bottom .column-right .tab-pane').data('id');
          var data1 = $(tabsID).find('.product-grids');
          var limit = $(tabsID).data('limit');
          var row = $(tabsID).data('row');
          occasion.doAjaxProductTabs2(href, data1, limit, row);
        },
        InitProductTabsBottom2: function(){
          $('.product-tab-bottom .nav-tabs li a:not(.first-tabs)').one('click',function(e){
            var href =  $(this).data('href');
            var id =  $(this).data('id');
            var data1 = $('#tab-product-'+ id + '').find('.product-grids');
            var limit = $('#tab-product-'+ id + '').data('limit');
            var row = $('#tab-product-'+ id + '').data('row');
            occasion.doAjaxProductTabs2(href, data1, limit, row);
          })
        },
      	show_brands: function(){
          $(".brands-list .brand").each(function(){ 
            if ($(this).find('ul li').length == 0) {
          		$(this).remove();
            }
          });
          $(".brands-list .brand").each(function(){
            var chi = $(this).find(".azbrands-title h3").text().trim();
            var ch = $(this).find("ul.brandgrid li:eq(0)").text().charAt(0);
            $('.occ-brands-table').children().each(function(){
              if( $(this).find('a').text().trim() == chi){
                if( !$(this).find('a').hasClass('readonly') )
                  $(this).find('a').addClass('readonly');
                return;
              }
            });
            if($(this).find(".azbrands-title").length == 0){

              $(this).find("ul.brandgrid").children().appendTo('.brand-' + ch + " ul.brandgrid");
              $(this).remove();
            }
          });

          $('.occ-brands-table .vendor-letter a.readonly').click(function(){
            var v = $(this).text();
            $('.brands-list .brand').hide().filter(function(e){
              var n =  $(this).find('h3').text();
              return n == v;
            }).show();
            $('.occ-brands-table .all-brand a').click(function(){
              $(".brands-list .brand").show();
            });
          });
          $('.occ-brands-table a.readonly').click(function(){
            $('.occ-brands-table a').removeClass('active');
            var $this = $(this);
            if (!$this.hasClass('active')) {
              $this.addClass('active');
            }
            var topbrand = $('.header').outerHeight();
            $('html, body').animate({scrollTop: topbrand}, 400);
          });



        },
 }
    
//    Ajax Load Slick
    $(document)
         .on( 'shopify:section:load', occasion.InitProductTabs )
         .on( 'shopify:section:unload', occasion.InitProductTabs)
  		 .on( 'shopify:section:load', occasion.InitProductTabs2 )
         .on( 'shopify:section:unload', occasion.InitProductTabs2)
    	 .on( 'shopify:section:load', occasion.InitProductTabs3 )
         .on( 'shopify:section:unload', occasion.InitProductTabs3);
    
    // Fix slick not resize
    /*$('.home-product-tab .nav-tabs li a').on('click',function(e){
        //console.log('vao 2');
        if ($(this).hasClass("isResize")) {
            var id =  $(this).data('id');
            var data1 = $('#tab-product-'+ id + '').find('.product-grids');
            //console.log('#tab-product-'+ id + '');
            data1.slick('refresh');  
            $(this).removeClass('isResize');            
        }
    })*/
    $( window ).resize(function() {
        $('.home-product-tab .nav-tabs li').find('a').each(function() {
            $(this).addClass('isResize');
        });
    });
    $('.home-product-tab .nav-tabs li a[data-toggle="tab"]').on('shown.bs.tab', function (e) {             
        if ($(this).hasClass("isResize")) {
            var id =  $(this).data('id');
            var data1 = $('#tab-product-'+ id + '').find('.product-grids');
            data1.slick('refresh');
            $(this).removeClass('isResize');            
        }
    })
  
})(jQuery);