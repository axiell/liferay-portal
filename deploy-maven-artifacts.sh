:
version=6.2.5d
repo_url=http://jenkins.axiell.local:8081
packaging=jar
for file in portal-client portal-service support-tomcat util-taglib portal-impl util-bridges portal-pacl util-java util-slf4j
do
echo "Deploying ${file}"
mvn deploy:deploy-file -DgroupId=com.liferay.portal -DartifactId=${file} -Dfile=/opt/.m2/repository/com/liferay/portal/${file}/${version}/${file}-${version}.${packaging} -DrepositoryId=central -Dversion=${version} -Dpackaging=${packaging} -Durl=${repo_url}/artifactory/simple/ext-release-local/
done
file=portal-web
packaging=war
echo "Deploying ${file}"
mvn deploy:deploy-file -DgroupId=com.liferay.portal -DartifactId=${file} -Dfile=/opt/.m2/repository/com/liferay/portal/${file}/${version}/${file}-${version}.${packaging} -DrepositoryId=central -Dversion=${version} -Dpackaging=${packaging} -Durl=${repo_url}/artifactory/simple/ext-release-local/
file=portal-parent
packaging=pom
echo "Deploying ${file}"
mvn deploy:deploy-file -DgroupId=com.liferay.portal -DartifactId=${file} -Dfile=/opt/.m2/repository/com/liferay/portal/${file}/${version}/${file}-${version}.${packaging} -DrepositoryId=central -Dversion=${version} -Dpackaging=${packaging} -Durl=${repo_url}/artifactory/simple/ext-release-local/


