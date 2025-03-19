'use strict'

document.addEventListener('DOMContentLoaded', () => {

  let background_color = 'black'
  let color = 'white'
  /* Do we have a selected menu item (not if we're viewing the welcome screen. */
  let lit_menu_item = document.querySelector(
    'body.wp-admin.js div#wpwrap div#adminmenumain div#adminmenuwrap ul#adminmenu li a.wp-menu-open')
  if (lit_menu_item) {
    const style = window.getComputedStyle(lit_menu_item)
    color = style.getPropertyValue('color')
    background_color = style.getPropertyValue('background-color')
  } else {
    lit_menu_item = document.querySelector(
      'body.wp-admin.js div#wpwrap div#adminmenumain div#adminmenuwrap ul#adminmenu li a')
    let style = window.getComputedStyle(lit_menu_item)
    color = style.getPropertyValue('color')
    lit_menu_item = document.querySelector(
      'body.wp-admin.js div#wpwrap div#adminmenumain div#adminmenuwrap ul#adminmenu')
    style = window.getComputedStyle(lit_menu_item)
    background_color = style.getPropertyValue('background-color')
  }

  const css = document.createElement('style')
  css.textContent = `html ul.ui-menu.ui-autocomplete.ui-front > li.ui-menu-item > div.ui-menu-item-wrapper.ui-state-active {
    background-color: ${background_color}; color: ${color};}`
  const head = document.head || document.getElementsByTagName('head')[0]
  head.appendChild(css)

  const menu_items = scrape_menu()
  const search_box = make_search_box()

  let selected_menu_item = null

  jQuery(search_box).autocomplete({
    minLength: 0,
    autoFocus: true,
    source: menu_items,

    select: function (event, menu_item) {
      document.location = menu_item.item.link
    },

  })
    .data('ui-autocomplete')._hack_hackrenderItem =
    function (menu_parent, menu_item) {
      const cls = (selected_menu_item && selected_menu_item.label === menu_item.label) ? 'active' : 'inactive'

      const li_item = jQuery('<li/>')
        .data('ui-autocomplete-item', menu_item.label)
        .addClass(cls)
        .append(menu_item.label)

      li_item.appendTo(menu_parent)
      console.log('rendered ' + menu_item.label + ' with ' + cls)

      return li_item
    }

  /**
   * Scrape the WordPress administrator menus.
   * @returns {*[]} An array of {name, link, icon, level}
   */
  function scrape_menu () {
    const menu_items = []
    const menus = document.querySelectorAll(
      'body.wp-admin.js div#wpwrap div#adminmenumain div#adminmenuwrap ul#adminmenu li')
    for (const menu of menus) {
      const link_element = menu.querySelector('a')
      if (link_element) {
        const link = link_element.getAttribute('href')
        const label = link_element.querySelector('div.wp-menu-name')?.innerText || null
        const icon_element = link_element.querySelector('div.wp-menu-image')
        const icon_classes = icon_element ? icon_element.classList.values() : []
        const icon = icon_classes.find(cl => cl.startsWith('dashicons-') && !cl.startsWith('dashicons-before')) || null
        if (label && link) {
          menu_items.push({ label, link, nest_level: 1 })
        }
      }
      if (menu.classList.contains('wp-has-submenu')) {
        let head_title = name
        const submenus = menu.querySelectorAll('ul li')
        for (const submenu of submenus) {
          if (submenu.classList.contains('wp-submenu-head')) {
            head_title = submenu.innerText || head_title
          } else {
            const link_element = submenu.querySelector('a')
            if (link_element) {
              const link = link_element.getAttribute('href')
              const name = ownText(link_element)
              if (name && link) {
                menu_items.push({ label: head_title + ' > ' + name, link, nest_level: 2 })
              }
            }
          }
        }
      }
    }
    return menu_items
  }

  /**
   * Like .innerText but excluding subelements.
   *
   * @param element
   * @returns string
   */
  function ownText (element) {
    return Array.prototype.reduce.call(element.childNodes, (acc, el) => {
      return acc + (3 === el.nodeType ? el.textContent : '')
    }, '')
  }

  /**
   * Create the search box
   * @returns {HTMLInputElement} The input element.
   */
  function make_search_box () {
    const inp = document.createElement('input')
    inp.type = 'text'
    inp.class = 'wp-ui-text-primary'
    inp.placeholder = 'Search Menus'
    inp.id = 'fuzzy-field'

    const con = document.createElement('li')
    con.id = 'fuzzy-container'
    con.class = 'menu-top'
    con.appendChild(inp)

    const menu = document.querySelector('#adminmenu')
    menu.prepend(con)

    return inp
  }

})
