public class KnowledgeTreeVisualizer_Helper {
    
    public static  list<Schema.DescribeDataCategoryGroupStructureResult> getCategories(string sObjectType)
    {
        list<Schema.DataCategoryGroupSObjectTypePair> pairs = new list<Schema.DataCategoryGroupSObjectTypePair>();
        list<string> objects = new list<string>();
        objects.add(sObjectType);
        List<Schema.DescribeDataCategoryGroupResult> describeCategoryResult =  Schema.describeDataCategoryGroups(objects);
        for(Schema.DescribeDataCategoryGroupResult s : describeCategoryResult)
        {
            Schema.DataCategoryGroupSObjectTypePair thisPair = new Schema.DataCategoryGroupSObjectTypePair();
            thisPair.sObject = sObjectType;
            thisPair.dataCategoryGroupName = s.getName();
            pairs.add(thisPair);            
        }
        list<Schema.DescribeDataCategoryGroupStructureResult> results = Schema.describeDataCategoryGroupStructures(pairs,false);
        
        return results;
    }    
    
    public static DataCategory[] getAllCategories(DataCategory [] categories)
    {
        if(categories.isEmpty())
        {
            return new DataCategory[]{};
                } 
        else
        {
            DataCategory [] categoriesClone = categories.clone();
            DataCategory category = categoriesClone[0];
            DataCategory[] allCategories = new DataCategory[]{category};
                categoriesClone.remove(0);
            categoriesClone.addAll(category.getChildCategories());
            allCategories.addAll(getAllCategories(categoriesClone));
            return allCategories;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static String getCategoryStructures(){
        return JSON.serialize(KnowledgeTreeVisualizer_Helper.getCategories('KnowledgeArticleVersion'));
    }
    
    @AuraEnabled(cacheable=true)
    public static List<knowledge__DataCategorySelection> getKnowledgeArticles(){
        return [SELECT toLabel(DataCategoryName),toLabel(DataCategoryGroupName),ParentId,Parent.Title,Parent.Summary FROM knowledge__DataCategorySelection WHERE ParentId IN (SELECT Id FROM Knowledge__kav WHERE IsLatestVersion = true)];
    }
    @AuraEnabled(cacheable=true)
    public static List<knowledge__DataCategorySelection> searchKnowledgeArticles(String searchTerm){
        String searchString = '%'+searchTerm+'%';
        return [SELECT toLabel(DataCategoryName),toLabel(DataCategoryGroupName),ParentId,Parent.Title,Parent.Summary FROM knowledge__DataCategorySelection WHERE ParentId IN (SELECT Id FROM Knowledge__kav WHERE IsLatestVersion = true) AND Parent.Title LIKE :searchString];
    }
    
    @AuraEnabled(cacheable=true)
    public static knowledge__DataCategorySelection getKnowledgeArticle(String articleId,String articleCategory){
        System.debug(articleCategory);
        List<knowledge__DataCategorySelection> articles = [SELECT toLabel(DataCategoryName),toLabel(DataCategoryGroupName),ParentId,Parent.Title,Parent.Summary FROM knowledge__DataCategorySelection WHERE ParentId IN (SELECT Id FROM Knowledge__kav WHERE IsLatestVersion = true) AND Parent.Id = :articleId];
        if(articleCategory!=''){
            knowledge__DataCategorySelection returnArticle;
            for(knowledge__DataCategorySelection article: articles){
                if(article.DataCategoryName == articleCategory){
                    System.debug(article);
                    returnArticle = article;
                }
            }
            return returnArticle;
        }
        else{
            return articles[0];
        }
    }
}