#!/usr/bin/env node

var fs = require('fs'),
  _ = require('underscore'),
  pwd = process.env.PWD,
  structure = [{
    name: '.git',
    type: 'd',
    children: [{
      name: 'hooks',
      type: 'd'
    }, {
      name: 'info',
      type: 'd',
      children: [{
        name: 'exclude',
        type: 'f'
      }]
    }, {
      name: 'objects',
      type: 'd',
      children: [{
        name: 'info',
        type: 'd'
      }, {
        name: 'pack',
        type: 'd'
      }]
    }, {
      name: 'refs',
      type: 'd',
      children: [{
        name: 'heads',
        type: 'd'
      }, {
        name: 'tags',
        type: 'd'
      }]
    }, {
      name: 'config',
      type: 'f',
      content: {
        'core': {
          repositoryformatversion: 0,
          filemode: true,
          bare: false,
          logallrefupdates: true,
          ignorecase: true,
          precomposeunicode: false
        }
      }
    }, {
      name: 'HEAD',
      type: 'f',
      content: 'ref: refs/heads/master\n'
    }, {
      name: 'description',
      type: 'f'
    }]
  }],
  dir_defaults = {
    mode: '0777'
  },
  file_defaults = {
    mode: '0666',
    content: ''
  };

function json2ini(json) {
  var content = '',
    pad = '  ',
    lf = '\n';
  for (section in json) {
    if (json.hasOwnProperty(section)) {
      content += '[' + section + ']' + lf;

      var sectionItems = json[section];
      for (key in sectionItems) {
        if (sectionItems.hasOwnProperty(key)) {
          content += pad + key + ' = ' + sectionItems[key] + lf;
        }
      }

    }
  }
  return content;
}

(function create_tree(tree, prefix) {
  if (_.isUndefined(prefix)) {
    prefix = pwd
  }
  _.each(tree, function(node) {
    if (node.type === 'd') {
      _.defaults(node, dir_defaults);
      var path = prefix + '/' + node.name;
      fs.mkdir(path, node.mode, function(err) {
        // Skip already exist error
        if (err && err.code !== 'EEXIST') {
          throw err;
        }
        if (_.isArray(node.children)) {
          create_tree(node.children, path);
        }
      });
    } else if (node.type === 'f') {
      _.defaults(node, file_defaults);
      var path = prefix + '/' + node.name;
      fs.open(path, 'w', node.mode, function(err, fd) {
        if (err) {
          throw err;
        }
        var content = (_.isObject(node.content)) ? json2ini(node.content) : node.content;
        fs.write(fd, content, null, null, null, function(err) {
          if (err) {
            throw err;
          }
          fs.close(fd, function() {
            if (err) {
              throw err;
            }
          });
        });
      });
    }
  });
})(structure);
