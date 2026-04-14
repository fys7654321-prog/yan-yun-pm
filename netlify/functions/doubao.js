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
责任人：${owner}

请把这个任务拆解成3-5个具体的子步骤，每个步骤用简短的话说明要做什么。格式要求：
- 每个子步骤一行
- 前面加序号
- 总字数不超过80字
- 直接输出，不要加标题`;

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
