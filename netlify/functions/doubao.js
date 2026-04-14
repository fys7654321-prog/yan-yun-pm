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
    const { task, owner } = JSON.parse(event.body);
    
    const prompt = `任务：${task}
负责人：${owner}

请拆解为3-5个简单子步骤，每步一行，总字数<80字。`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

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
            text: prompt
          }]
        }]
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }

    const data = await response.json();
    
    let result = '';
    if (data.output && data.output[0] && data.output[0].content) {
      const text = data.output[0].content.find(c => c.type === 'output_text');
      result = text ? text.text : JSON.stringify(data);
    } else if (data.output && data.output.text) {
      result = data.output.text;
    } else {
      result = JSON.stringify(data);
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
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ result: '⚠️ AI暂时不可用，请稍后重试或手动拆解任务。' })
    };
  }
};
