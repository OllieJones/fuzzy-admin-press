'use strict'

document.addEventListener('DOMContentLoaded', () => {

    define_mixins()

    retrieve_preferred_style()

    const menu_items = scrape_menu()
    let previous_focus_element = false
    let previous_shift_time = false

    const search_box = make_search_box()
    if (search_box) {

      shift_shift()

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
          if (previous_focus_element) {
            previous_focus_element.focus()
            previous_focus_element = null
          }
        },

      })
    }

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
          case 'wp-admin-bar-comments':
            do_top = false
            do_sub = false
            break
          case 'wp-admin-bar-site-name':
          case 'wp-admin-bar-my-account':
            do_top = false
            do_sub = true
            break
          default:
            do_top = true
            do_sub = true
        }
        let top_item = null
        let sub_items = []
        let head_title = null
        const link_element = menu.querySelector('a')
        if (do_top && link_element) {
          const link = link_element.getAttribute('href')
          const label = link_element.innerText || null
          head_title = label
          top_item = label && link ? { label, link, nest_level: 1 } : null
        }
        if (do_sub) {
          const submenus = menu.querySelectorAll('ul li')
          for (const submenu of submenus) {
            const sub_title = []
            sub_title.push_only_string(head_title)
            const link_element = submenu.querySelector('a')
            if (link_element) {
              const link = link_element.getAttribute('href')
              const name = link_element.ownText()
              sub_title.push_only_string(name)
              if (name && link) {
                sub_items.push({ label: sub_title.join(' > '), link, nest_level: 2 })
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

      const menus = document.querySelectorAll(
        'body.wp-admin.js div#wpwrap div#adminmenumain div#adminmenuwrap ul#adminmenu  li')
      for (const menu of menus) {
        let top_item = null
        const sub_items = []
        const link_element = menu.querySelector('a')
        if (link_element) {
          const link = link_element.getAttribute('href')
          const label = link_element.querySelector('div.wp-menu-name')?.ownText() || null
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
              head_title = submenu.ownText() || head_title
            } else {
              const link_element = submenu.querySelector('a')
              if (link_element) {
                const link = link_element.getAttribute('href')
                const name = link_element.ownText()
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
     * Create the search box
     * @returns {HTMLInputElement} The input element.
     */
    function make_search_box () {
      const inp = document.createElement('input')
      inp.type = 'text'
      inp.class = 'wp-ui-text-primary'
      inp.dataset.placeholder = fuzzy_admin_press_i18n.placeholder
      inp.dataset.placeholder_active = fuzzy_admin_press_i18n.placeholder_active
      inp.placeholder = inp.dataset.placeholder
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
      const el = event.target
      el.placeholder = active ? el.dataset.placeholder_active : el.dataset.placeholder
      el.classList.add(active ? 'active' : 'inactive')
      el.classList.remove(!active ? 'active' : 'inactive')
    }

    /**
     *   <shift><shift> within 500 ms puts us into search box.
     *   <esc> gets us out again.
     *
     *   //TODO deal with very narrow
     */
    function shift_shift (shift = 'Shift', esc = 'Escape', delay = 500) {
      /* Performance-important handler here: this intercepts
       * ALL keystrokes to pick up on shift-shift and escape.
       * Please be careful to minimize the work it needs to do! */
      document.addEventListener('keyup', event => {
        const key = event.key
        if (esc === key) {
          if (previous_focus_element) {
            if (search_box.classList.contains('active')) {
              activate(event, false)
              previous_focus_element.focus()
            }
            previous_focus_element = false
          }
          previous_shift_time = false
        } else if (shift === key) {
          const now = Date.now()
          if (previous_shift_time && (now - previous_shift_time) < delay) {
            const focus = document.activeElement
            if (focus !== search_box) {
              previous_focus_element = focus
              search_box.focus()
            }
            previous_shift_time = false
          } else {
            previous_shift_time = now
          }
        } else {
          /* Not shift, not esc */
          previous_shift_time = false
        }
      })

      search_box.parentElement.addEventListener('click', event => {
          search_box.focus()
        }
      )
      search_box.addEventListener('focus', event => {
        activate(event, true)
        event.target.select()
      })
      search_box.addEventListener('blur', event => {

        activate(event, false)
        if (previous_focus_element) {
          previous_focus_element.focus()
          previous_focus_element = false
        }

      })

    }

    function define_mixins () {
      /**
       * Like .innerText but excluding subelements.
       *
       * @returns string
       */
      HTMLElement.prototype.ownText = function () {
        return Array.prototype.reduce.call(this.childNodes, (acc, el) => {
          return acc + (3 === el.nodeType ? el.textContent : '')
        }, '')
      }
      /**
       * Push only if it's a nonempty string.
       *
       * @returns int The new length property of the object upon which the method was called.
       */
      Array.prototype.push_only_string = function (s) {
        'string' === typeof s && s.length > 0 && this.push(s)
        return this.length
      }
    }

  }
)
