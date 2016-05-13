/**
 * This is where we extend the abilities of adding an enclosing div wrapper with specified class(className) for using of '^^^className'.
 * For example, the following illustration shows the input and output.
 *          +-----------+     +-----------------------------------------+
 *          | '^^^xyz', |     | <div class="xyz">                       |
 *          | '**ab**', |     |   <p><strong>ab</strong></p>            |
 *          | '~~~',    |     |   <pre>                                 |
 *          | 'cc',     | ==> |     <code class="hljs stylus">cc        |
 *          | 'dd',     |     |       <span class="hljs-tag">dd</span>  |
 *          | '~~~',    |     |     </code>                             |
 *          | '^^^'     |     |   </pre>                                |
 *          |           |     | </div>                                  |
 *          +-----------+     +-----------------------------------------+
 * Note: the div wrapper can't not be used recursively, for instance, you can not use it like:
 *          +-----------+
 *          | '^^^xyz', |
 *          | '^^^abc', |
 *          | '~~~',    |
 *          | 'dd',     |
 *          | '~~~',    |
 *          | '^^^',    |
 *          | '^^^'     |
 *          +-----------+
 * The following illustration indicate the typical flow how the whole bunch stuff works:
 *          
 *              +-----------+                                   +-----------+
 *              | Lex Rules |                                   | Renderer  |
 *              +-----------+                                   +-----------+
 *                    |                                               |
 *                    |                                               |
 *                    v                                               v
 *   +-----+     +-------+  Lexing(Lexer.token)   +--------+  Rendering Current Token     +--------+
 *   | src | --> | Lexer | ---------------------> | Parser | ---------------------------> | output |
 *   +-----+     +-------+                        +--------+                              +--------+
 *   
 * @author Zhizhen Fan
 * @created 2016.05.11
 * Inspired by marked.js by Christopher Jeffrey.
 */

;(function(){

  /**
   * Overwrite the static Lex method to add new rules.
   */
  marked.Lexer.lex = function(src, options){
    var lexer = new marked.Lexer(options);
    _.extend(lexer.rules, {
      // Append the new added rules here
      clsfences: /^ *(\^{3,}) *(\S+(?: +\S+)*)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/
    });
    return lexer.lex(src);
  };


  /**
   * Overwrite the Lexing function to apply new rules in the loop.
   */
  marked.Lexer.prototype.token = function(src, top, bq){
    var src = src.replace(/^ +$/gm, ''),
      next, loose, cap, bull, b, item, space, i, l;

    while(src){
      // newline
      if(cap = this.rules.newline.exec(src)){
        src = src.substring(cap[0].length);
        if(cap[0].length > 1){
          this.tokens.push({
            type: 'space'
          });
        }
      }

      // code
      if(cap = this.rules.code.exec(src)){
        src = src.substring(cap[0].length);
        cap = cap[0].replace(/^ {4}/gm, '');
        this.tokens.push({
          type: 'code',
          text: !this.options.pedantic ? cap.replace(/\n+$/, '') : cap
        });
        continue;
      }

      // fences (gfm)
      if(cap = this.rules.fences.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'code',
          lang: cap[2],
          text: cap[3] || ''
        });
        continue;
      }

      // fences for div wrapper with specified class
      if(cap = this.rules.clsfences.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'clswrapper',
          cls: cap[2],
          text: cap[3]
        });
        continue;
      }

      // heading
      if(cap = this.rules.heading.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[1].length,
          text: cap[2]
        });
        continue;
      }

      // table no leading pipe (gfm)
      if(top && (cap = this.rules.nptable.exec(src))){
        src = src.substring(cap[0].length);

        item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3].replace(/\n$/, '').split('\n')
        };

        for(i = 0; i < item.align.length; i++){
          if(/^ *-+: *$/.test(item.align[i])){
            item.align[i] = 'right';
          } else if(/^ *:-+: *$/.test(item.align[i])){
            item.align[i] = 'center';
          } else if(/^ *:-+ *$/.test(item.align[i])){
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        for(i = 0; i < item.cells.length; i++){
          item.cells[i] = item.cells[i].split(/ *\| */);
        }

        this.tokens.push(item);

        continue;
      }

      // lheading
      if(cap = this.rules.lheading.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[2] === '=' ? 1 : 2,
          text: cap[1]
        });
        continue;
      }

      // hr
      if(cap = this.rules.hr.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'hr'
        });
        continue;
      }

      // blockquote
      if(cap = this.rules.blockquote.exec(src)){
        src = src.substring(cap[0].length);

        this.tokens.push({
          type: 'blockquote_start'
        });

        cap = cap[0].replace(/^ *> ?/gm, '');

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.token(cap, top, true);

        this.tokens.push({
          type: 'blockquote_end'
        });

        continue;
      }

      // list
      if(cap = this.rules.list.exec(src)){
        src = src.substring(cap[0].length);
        bull = cap[2];

        this.tokens.push({
          type: 'list_start',
          ordered: bull.length > 1
        });

        // Get each top-level item.
        cap = cap[0].match(this.rules.item);

        next = false;
        l = cap.length;
        i = 0;

        for(; i < l; i++){
          item = cap[i];

          // Remove the list item's bullet
          // so it is seen as the next token.
          space = item.length;
          item = item.replace(/^ *([*+-]|\d+\.) +/, '');

          // Outdent whatever the
          // list item contains. Hacky.
          if(~item.indexOf('\n ')){
            space -= item.length;
            item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
          }

          // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.
          if(this.options.smartLists && i !== l - 1){
            b = block.bullet.exec(cap[i + 1])[0];
            if(bull !== b && !(bull.length > 1 && b.length > 1)){
              src = cap.slice(i + 1).join('\n') + src;
              i = l - 1;
            }
          }

          // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.
          loose = next || /\n\n(?!\s*$)/.test(item);
          if(i !== l - 1){
            next = item.charAt(item.length - 1) === '\n';
            if(!loose) loose = next;
          }

          this.tokens.push({
            type: loose ? 'loose_item_start' : 'list_item_start'
          });

          // Recurse.
          this.token(item, false, bq);

          this.tokens.push({
            type: 'list_item_end'
          });
        }

        this.tokens.push({
          type: 'list_end'
        });

        continue;
      }

      // html
      if(cap = this.rules.html.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: this.options.sanitize ? 'paragraph' : 'html',
          pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
          text: cap[0]
        });
        continue;
      }

      // def
      if((!bq && top) && (cap = this.rules.def.exec(src))){
        src = src.substring(cap[0].length);
        this.tokens.links[cap[1].toLowerCase()] = {
          href: cap[2],
          title: cap[3]
        };
        continue;
      }

      // table (gfm)
      if(top && (cap = this.rules.table.exec(src))){
        src = src.substring(cap[0].length);

        item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
        };

        for(i = 0; i < item.align.length; i++){
          if(/^ *-+: *$/.test(item.align[i])){
            item.align[i] = 'right';
          } else if(/^ *:-+: *$/.test(item.align[i])){
            item.align[i] = 'center';
          } else if(/^ *:-+ *$/.test(item.align[i])){
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        for(i = 0; i < item.cells.length; i++){
          item.cells[i] = item.cells[i]
            .replace(/^ *\| *| *\| *$/g, '')
            .split(/ *\| */);
        }

        this.tokens.push(item);

        continue;
      }

      // top-level paragraph
      if(top && (cap = this.rules.paragraph.exec(src))){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'paragraph',
          text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
        });
        continue;
      }

      // text
      if(cap = this.rules.text.exec(src)){
        // Top-level should never reach here.
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'text',
          text: cap[0]
        });
        continue;
      }

      if(src){
        throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
      }
    }

    return this.tokens;
  };

  /**
   * Overwrite the function to apply the new renderers.
   */
  marked.Parser.prototype.tok = function(){
    switch(this.token.type){
      case 'space':
        return '';
      case 'hr':
        return this.renderer.hr();
      case 'heading':
        return this.renderer.heading(
          this.inline.output(this.token.text),
          this.token.depth,
          this.token.text);
      case 'code':
        return this.renderer.code(this.token.text,
          this.token.lang,
          this.token.escaped);
      case 'clswrapper':
        return this.renderer.clswrapper(this.token.cls,
          this.token.text,
          this.token.escaped);
      case 'table':
        var header = '',
          body = '',
          i, row, cell, flags, j;

        // header
        cell = '';
        for(i = 0; i < this.token.header.length; i++){
          flags = {
            header: true,
            align: this.token.align[i]
          };
          cell += this.renderer.tablecell(
            this.inline.output(this.token.header[i]), {
              header: true,
              align: this.token.align[i]
            }
          );
        }
        header += this.renderer.tablerow(cell);

        for(i = 0; i < this.token.cells.length; i++){
          row = this.token.cells[i];

          cell = '';
          for(j = 0; j < row.length; j++){
            cell += this.renderer.tablecell(
              this.inline.output(row[j]), {
                header: false,
                align: this.token.align[j]
              }
            );
          }

          body += this.renderer.tablerow(cell);
        }
        return this.renderer.table(header, body);
      case 'blockquote_start':
        var body = '';

        while(this.next().type !== 'blockquote_end'){
          body += this.tok();
        }

        return this.renderer.blockquote(body);
      case 'list_start':
        var body = '',
          ordered = this.token.ordered;

        while(this.next().type !== 'list_end'){
          body += this.tok();
        }

        return this.renderer.list(body, ordered);
      case 'list_item_start':
        var body = '';

        while(this.next().type !== 'list_item_end'){
          body += this.token.type === 'text' ? this.parseText() : this.tok();
        }

        return this.renderer.listitem(body);
      case 'loose_item_start':
        var body = '';

        while(this.next().type !== 'list_item_end'){
          body += this.tok();
        }

        return this.renderer.listitem(body);
      case 'html':
        var html = !this.token.pre && !this.options.pedantic ? this.inline.output(this.token.text) : this.token.text;
        return this.renderer.html(html);
      case 'paragraph':
        return this.renderer.paragraph(this.inline.output(this.token.text));
      case 'text':
        return this.renderer.paragraph(this.parseText());
    }
  };

  /**
   * Extend the Renderer with new type and its handler.
   */
  _.extend(marked.Renderer.prototype, {
    clswrapper: function(cls, text){
      return '<div class="' + cls + '">' + marked.Parser.parse(marked.Lexer.lex(text, this.options), this.options) + '</div>\n';
    }
  });

})();