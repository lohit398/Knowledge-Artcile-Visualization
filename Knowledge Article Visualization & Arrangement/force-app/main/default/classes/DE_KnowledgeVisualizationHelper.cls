public class DE_KnowledgeVisualizationHelper {
	@AuraEnabled(cacheable=true)
    public static List<knowledge__DataCategorySelection> getKnowledgeCategories(){
        return [SELECT DataCategoryName,DataCategoryGroupName,ParentId,Parent.Title FROM knowledge__DataCategorySelection];
    }
    
    @AuraEnabled(cacheable=true)
    public static Knowledge__kav getKnowledgeArticle(String knowledgeArticleId){
        return [SELECT FAQ_Answer__c,Title,Id,VersionNumber,Language,RecordType.Name,ArticleNumber from Knowledge__kav where Id =: knowledgeArticleId];
    }
}