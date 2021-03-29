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
}