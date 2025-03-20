'use strict'

document.addEventListener('DOMContentLoaded', () => {
    retrieve_preferred_style()

    const menu_items = scrape_menu()
    const search_box = make_search_box()

    shift_shift()

    search_box.parentElement.addEventListener('click', event => {
        search_box.focus()
      }
    )
    search_box.addEventListener('focus', event => {
      activate(event, true)
      event.target.select()
    })
    search_box.addEventListener('blur', event => {
      const target = event.target
      activate(event, false)
    })

    jQuery(search_box).autocomplete({
      minLength: 0,
      delay: 0,
      autoFocus: true,
      source: menu_items,

      select: (event, menu_item) => {
        document.location = menu_item.item.link
      },
      open: (event, menu_item) => {
        activate(event, true)
      },
      close: (event, menu_item) => {
        activate(event, false)
      },

    })

    /**
     * Scrape the WordPress administrator menus.
     * @returns {*[]} An array of {name, link, icon, level}
     */
    function scrape_menu () {
      const menu_items = []
      const quicklinks = document.querySelectorAll(
        'body.wp-admin.js div#wpwrap div#wpadminbar div#wp-toolbar > ul > li')

      for (const menu of quicklinks) {
        let do_top = false
        let do_sub = false
        switch (menu.id) {
          case 'wp-admin-bar-menu-toggle':
          case 'wp-admin-bar-wp-logo':
            do_top = false
            do_sub = false
            break
          case 'wp-admin-bar-site-name':
            do_top = false
            do_sub = true
            break
          default:
            do_top = true
            do_sub = true
        }
      }

      const menus = document.querySelectorAll(
        'body.wp-admin.js div#wpwrap div#adminmenumain div#adminmenuwrap ul#adminmenu  li')
      for (const menu of menus) {
        let top_item = null
        const sub_items = []
        const link_element = menu.querySelector('a')
        if (link_element) {
          const link = link_element.getAttribute('href')
          const label = link_element.querySelector('div.wp-menu-name')?.innerText || null
          const icon_element = link_element.querySelector('div.wp-menu-image')
          const icon_classes = icon_element ? icon_element.classList.values() : []
          const icon = icon_classes.find(cl => cl.startsWith('dashicons-') && !cl.startsWith('dashicons-before')) || null
          top_item = label && link ? { label, link, nest_level: 1 } : null
        }
        if (menu.classList.contains('wp-has-submenu')) {
          let head_title = ''
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
                  sub_items.push({ label: head_title + ' > ' + name, link, nest_level: 2 })
                }
              }
            }
          }
        }
        /* Suppress the top item if it duplicates the first sub item */
        if (top_item && sub_items.length > 0 && sub_items[0] && top_item.link === sub_items[0].link) {
          top_item = null
        }
        top_item && menu_items.push(top_item)
        sub_items.map(sub_item => sub_item && menu_items.push(sub_item))

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
      inp.placeholder = 'Shift Shift Search'
      inp.id = 'fuzzy-field'

      const con = document.createElement('li')
      con.id = 'fuzzy-container'
      con.class = 'menu-top'
      inp.dataset.description = '<shift><shift> to activate'
      inp.title = inp.dataset.description
      con.appendChild(inp)

      const menu = document.querySelector('#adminmenu')
      menu.prepend(con)

      return inp
    }

    function retrieve_preferred_style () {
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
    }

    function activate (event, active) {
      event.target.classList.add(active ? 'active' : 'inactive')
      event.target.classList.remove(!active ? 'active' : 'inactive')
    }

    /**
     *   <shift><shift> within 500 ms puts us into search box.
     *   <esc> gets us out again.
     *
     *   //TODO deal with very narrow
     */
    function shift_shift () {
      let previous_focus_element = false
      let previous_shift_time = false
      document.addEventListener('keydown', event => {
        const focused = document.activeElement
        if (focused !== search_box) {
          if ('Shift' === event.key) {
            const now = Date.now()
            if (previous_shift_time && (now - previous_shift_time) < 500) {
              previous_shift_time = false
              previous_focus_element = focused
              search_box.focus()
            } else {
              previous_shift_time = now
            }
          } else {
            previous_shift_time = false
          }
        }
        if ('Escape' === event.key) {
          if (previous_focus_element) {
            if (search_box.classList.contains('active')) {
              event.target.classList.add('inactive')
              event.target.classList.remove('active')
              previous_focus_element.focus()
            }
            previous_focus_element = false
          }
        }
      })
    }

  }
)
