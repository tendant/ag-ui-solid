import type { TranslationDict } from '../types';

export const zh: TranslationDict = {
  composer: {
    placeholder: '输入消息...',
    send: '发送',
    sending: '发送中...',
  },
  message: {
    user: '用户',
    assistant: '助手',
    system: '系统',
    error: '错误',
  },
  toolResult: {
    success: '成功',
    error: '错误',
    pending: '处理中',
    input: '输入',
    output: '输出',
  },
  chat: {
    errorOccurred: '发生错误',
    retry: '重试',
    typing: '输入中...',
    noMessages: '暂无消息。开始对话吧！',
  },
};
