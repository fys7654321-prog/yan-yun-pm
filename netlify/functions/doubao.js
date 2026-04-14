exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { tasks } = JSON.parse(event.body);
    
    // 构建进度数据上下文
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.filter(t => t.status === 'progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    
    const context = `📊 项目进度数据
    
当前完成度：${Math.round(done/total*100)}% (${done}/${total})
进行中：${progress}项 | 待办：${todo}项

待办任务详情：
${tasks.filter(t => t.status !== 'done').map(t => `- ${t.name} [${t.owner}] ${t.date ? '📅 ' + t.date : ''}`).join('\n')}

已完成任务：
${tasks.filter(t => t.status === 'done').map(t => `- ${t.name} [${t.owner}]`).join('\n')}`;

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 9d5e0676-82cb-4766-87c5-d6056db32dd1'
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-260215',
        input: [{
          role: 'user',
          content: [{
            type: 'input_text',
            text: `请基于以下项目进度数据，识别潜在风险点并给出简短总结（不超过150字）：

${context}

请直接输出风险分析，不要加标题。`
          }]
        }]
      })
    });

    const data = await response.json();
    
    let result = '';
    if (data.output && data.output[0] && data.output[0].content) {
      const text = data.output[0].content.find(c => c.type === 'output_text');
      result = text ? text.text : '';
    } else if (data.output && data.output.text) {
      result = data.output.text;
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ result })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
