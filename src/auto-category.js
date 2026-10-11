export const CATEGORY_LIST=['文学故事','科普百科','历史人物','体育运动','学习资料','未分类'];
export function recommendCategory(title='',detail=''){
 const t=String(title).toLowerCase(),text=(t+' '+String(detail).slice(0,12000)).toLowerCase();
 if(/\bghost\b.*jason reynolds|\b(because of winn.?dixie|the westing game|secret garden|journey to the river sea|the explorer|maisie day|jamie drake|boy who made everyone laugh|rainforest relay|lost rainforest|life as we knew it)\b|西游记|童话|小说|故事集/.test(t))return {category:'文学故事',reason:'书名包含故事/小说线索（请核对）'};
 const rules=[['学习资料',/教材|练习|试题|课本|语法|\b(workbook|textbook|grammar|worksheet|exam|spelling)\b/],['历史人物',/历史|传记|人物|\b(history|biography|biographies|encyclopedia of world history|muhammad ali|jim thorpe|roberto clemente|babe didrikson|olympic gold)\b/],['体育运动',/体育|运动|足球|篮球|棒球|\b(sport|sports|athlete|athletes|soccer|football|basketball|baseball|olympic|champion|champions)\b/],['科普百科',/科普|百科|科学|动物|植物|雨林|宇宙|\b(science|scientific|encyclopedia|rainforest|rain forest|amazon|gorillas|animal|animals|food chains|forest|geographic|spacetime|chocolate)\b/],['文学故事',/文学|小说|童话|诗歌|绘本|\b(novel|novels|fiction|poems|poetry|tale|tales|story|stories)\b/]];
 for(const [category,re] of rules)if(re.test(t))return {category,reason:'依据书名关键词（请核对）'};
 for(const [category,re] of rules)if(re.test(text))return {category,reason:'依据PDF元数据或首页文字（请核对）'};
 return {category:'未分类',reason:'线索不足，留待人工确认'};
}
