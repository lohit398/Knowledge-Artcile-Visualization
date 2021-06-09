public class DE_KnowledgeVisualizationHelper {
    @AuraEnabled(cacheable=true)
    public static List<knowledge__DataCategorySelection> getKnowledgeCategories(){
        return [SELECT DataCategoryName,DataCategoryGroupName,ParentId,Parent.Title FROM knowledge__DataCategorySelection WHERE ParentId IN (SELECT Id FROM Knowledge__kav WHERE IsLatestVersion = true)];
    }
    
    @AuraEnabled(cacheable=true)
    public static Knowledge__kav getKnowledgeArticle(String knowledgeArticleId){
        Knowledge__kav kA =  [SELECT Title from Knowledge__kav where Id =: knowledgeArticleId UPDATE VIEWSTAT];
        return [SELECT FAQ_Answer__c,Title,Id,VersionNumber,Language,RecordType.Name,ArticleNumber from Knowledge__kav where Id =: knowledgeArticleId];
    }
    @AuraEnabled
    public static Integer voteArticle(String knowledgeArticleId, Boolean vote){
        Knowledge__kav k = [SELECT Title,Id,VersionNumber,Language,RecordType.Name,ArticleNumber from Knowledge__kav where Id =: knowledgeArticleId];
        artfeed__Article_Feedback__c articleFeedback = new artfeed__Article_Feedback__c();
        articleFeedback.artfeed__Article_ID__c = knowledgeArticleId;
        System.debug(vote);
        articleFeedback.artfeed__Like__c = vote;
        articleFeedback.artfeed__Feedback_Source__c = 'Communities';
        articleFeedback.artfeed__Article_Type__c = 'Knowledge__kav';
        articleFeedback.artfeed__Article_Title__c = k.Title;
        articleFeedback.artfeed__Article_Number__c = k.ArticleNumber;
        INSERT articleFeedback;
        return 1;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<artfeed__Article_Feedback__c> getFeedback(String knowledgeArticleId){
        return [SELECT artfeed__Like__c FROM artfeed__Article_Feedback__c where artfeed__Article_ID__c = :knowledgeArticleId];
    }
}