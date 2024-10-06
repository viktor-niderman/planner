<template>
<div>
  <div v-if="editor">
    <bubble-menu
      class="bubble-menu"
      :tippy-options="{ duration: 100 }"
      :editor="editor"
    >
      <button aria-expanded="false" @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        Bold
      </button>
      <button aria-expanded="false" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        Italic
      </button>
      <button aria-expanded="false" @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
        Strike
      </button>
    </bubble-menu>
  </div>

  <editor-content :editor="editor" />
</div>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import {
  BubbleMenu,
  Editor,
  EditorContent,
} from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
    BubbleMenu,
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      editor: null,
    }
  },

  watch: {
    modelValue(value) {
      const isSame = this.editor.getHTML() === value

      if (isSame) {
        return
      }

      this.editor.commands.setContent(value, false)
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
      ],
      content: this.modelValue,
      onUpdate: () => {
        this.$emit('update:modelValue', this.editor.getHTML())
      },
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
:root {
  /* Основные цветовые переменные */
  --color-primary: #6a0dad;               /* Пурпурный */
  --color-primary-light: #e0cfff;         /* Светло-пурпурный */
  --color-primary-dark: #5a0ab3;          /* Темно-пурпурный */

  --color-primary-contrast: #ffffff;      /* Контрастный цвет для пурпурного */

  --color-black: #1f1f1f;                  /* Темно-чёрный для текста */
  --color-white: #ffffff;                  /* Белый */

  --color-gray-light: #f5f5f5;             /* Очень светло-серый */
  --color-gray: #9ca3af;                   /* Средне-серый */
  --color-gray-dark: #4b5563;              /* Тёмно-серый */
  --color-gray-dark-light: #616e7c;        /* Светлее тёмно-серого */

  /* Тени */
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
  0 1px 3px rgba(0, 0, 0, 0.06);

  /* Отступы */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;

  /* Радиусы */
  --border-radius-sm: 0.3rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.7rem;

  /* Переходы */
  --transition-duration: 0.3s;
  --transition-ease: ease-in-out;
}

/* Общие стили для редактора */
.tiptap {
  height: 90vh;
  overflow-y: scroll;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 1rem;
  color: var(--color-black);
  line-height: 1.6;
  padding: var(--spacing-md);
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow);

  /* Удаление верхнего отступа у первого ребенка */
  &:first-child {
    margin-top: 0;
  }

  /* Стили списков */
  ul,
  ol {
    padding-left: var(--spacing-md);
    margin: var(--spacing-lg) 0;

    li {
      margin-bottom: var(--spacing-xs);

      p {
        margin: 0;
      }
    }
  }

  /* Стили заголовков */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: var(--spacing-lg) 0 var(--spacing-sm);
    font-weight: 600;
    line-height: 1.2;
    color: var(--color-black);
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.75rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  h4 {
    font-size: 1.25rem;
  }

  h5 {
    font-size: 1rem;
  }

  h6 {
    font-size: 0.875rem;
  }

  /* Стили кода и предформатированного текста */
  code {
    background-color: var(--color-primary-light);
    border-radius: var(--border-radius-sm);
    color: var(--color-black);
    font-size: 0.85rem;
    padding: 0.2em 0.4em;
    font-family: 'Courier New', Courier, monospace;
  }

  pre {
    background-color: var(--color-gray-light);
    border-radius: var(--border-radius-md);
    color: var(--color-black);
    font-family: 'JetBrains Mono', monospace;
    padding: var(--spacing-md);
    overflow-x: auto;
    margin: var(--spacing-lg) 0;

    code {
      background: none;
      color: inherit;
      font-size: 0.85rem;
      padding: 0;
    }
  }

  /* Стили цитат */
  blockquote {
    border-left: 4px solid var(--color-gray);
    padding-left: var(--spacing-md);
    color: var(--color-gray-dark);
    font-style: italic;
    margin: var(--spacing-lg) 0;
  }

  /* Стили горизонтальной линии */
  hr {
    border: none;
    border-top: 1px solid var(--color-gray-light);
    margin: var(--spacing-lg) 0;
  }
}

/* Стили Bubble Menu */
.bubble-menu {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  z-index: 10;

  button {
    background-color: transparent;
    border: none;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: background-color var(--transition-duration) var(--transition-ease);

    &:hover {
      background-color: var(--color-gray-light);
    }

    &.is-active {
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);

      &:hover {
        background-color: var(--color-primary-dark);
      }
    }

    /* Иконки или текст внутри кнопки */
    svg {
      width: 1em;
      height: 1em;
      fill: currentColor;
    }

    /* Пример стилизации текста кнопки */
    &.text-button {
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

/* Стили Floating Menu (если используется) */
.floating-menu {
  display: flex;
  background-color: var(--color-gray-dark);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow);
  gap: var(--spacing-sm);

  button {
    background-color: transparent;
    border: none;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: background-color var(--transition-duration) var(--transition-ease), color var(--transition-duration) var(--transition-ease);

    &:hover {
      background-color: var(--color-gray-dark-light);
    }

    &.is-active {
      background-color: var(--color-white);
      color: var(--color-primary);

      &:hover {
        background-color: var(--color-primary-light);
      }
    }

    svg {
      width: 1em;
      height: 1em;
      fill: currentColor;
    }

    &.text-button {
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

/* Дополнительные улучшения для редактора */
.editor-content {
  min-height: 300px;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-md);
  background-color: var(--color-white);
  box-shadow: var(--shadow);
  overflow-y: auto;
  transition: border-color var(--transition-duration) var(--transition-ease);

  &:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(106, 13, 173, 0.2);
  }

  p {
    margin: var(--spacing-sm) 0;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .bubble-menu,
  .floating-menu {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .bubble-menu button,
  .floating-menu button {
    width: 100%;
    text-align: center;
  }
}
</style>
