/**
 * ESLint rule to prevent unnecessary HTML entities in JSX/TSX
 * 
 * This rule flags HTML entities that are unnecessary in JSX/TSX context
 * since JSX handles these characters natively.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unnecessary HTML entities in JSX/TSX',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      unnecessaryHtmlEntity: 'Unnecessary HTML entity "{{entity}}" found. Use "{{replacement}}" instead in JSX/TSX.',
    },
  },

  create(context) {
    // HTML entities that are unnecessary in JSX/TSX
    const UNNECESSARY_ENTITIES = {
      '&apos;': "'",
      '&quot;': '"',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&ldquo;': '"',
      '&rdquo;': '"',
      '&lsquo;': "'",
      '&rsquo;': "'",
      '&hellip;': '...',
      '&mdash;': '—',
      '&ndash;': '–'
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkForUnnecessaryEntities(node, node.value, context, UNNECESSARY_ENTITIES);
        }
      },

      JSXText(node) {
        checkForUnnecessaryEntities(node, node.value, context, UNNECESSARY_ENTITIES);
      },

      TemplateLiteral(node) {
        node.quasis.forEach(quasi => {
          checkForUnnecessaryEntities(quasi, quasi.value.raw, context, UNNECESSARY_ENTITIES);
        });
      }
    };
  },
};

function checkForUnnecessaryEntities(node, text, context, entities) {
  for (const [entity, replacement] of Object.entries(entities)) {
    if (text.includes(entity)) {
      context.report({
        node,
        messageId: 'unnecessaryHtmlEntity',
        data: {
          entity,
          replacement,
        },
        fix(fixer) {
          return fixer.replaceText(node, text.replace(new RegExp(entity, 'g'), replacement));
        },
      });
    }
  }
} 